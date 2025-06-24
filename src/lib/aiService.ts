
export async function processImageWithAI(
  file: File, 
  model: string, 
  apiKey: string
): Promise<{ title: string; keywords: string[]; category: string }> {
  console.log(`Processing ${file.name} with ${model}`);
  
  // Convert image to base64
  const base64 = await fileToBase64(file);
  
  const prompt = `This is a stock photo. Generate an SEO-friendly title (max 70 characters), up to 50 microstock-style keywords, and select an Adobe Stock category. Return a JSON like this: { "title": "...", "keywords": ["..."], "category": "..." }`;

  try {
    let response;
    
    switch (model) {
      case 'gemini-2.0-flash':
        response = await callGeminiAPI(base64, prompt, apiKey);
        break;
      case 'claude-3-5-sonnet':
        response = await callClaudeAPI(base64, prompt, apiKey);
        break;
      case 'gpt-4o':
      case 'gpt-4o-mini':
        response = await callOpenAIAPI(base64, prompt, apiKey, model);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    // Parse and validate response
    const metadata = parseAIResponse(response);
    console.log(`Successfully processed ${file.name}:`, metadata);
    
    return metadata;
  } catch (error) {
    console.error(`Error processing ${file.name}:`, error);
    throw error;
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/... prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callGeminiAPI(base64: string, prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

async function callClaudeAPI(base64: string, prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64
            }
          }
        ]
      }]
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

async function callOpenAIAPI(base64: string, prompt: string, apiKey: string, model: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model === 'gpt-4o-mini' ? 'gpt-4o-mini' : 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64}`
            }
          }
        ]
      }],
      max_tokens: 1000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function parseAIResponse(response: string): { title: string; keywords: string[]; category: string } {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.title || !parsed.keywords || !parsed.category) {
      throw new Error('Invalid response structure');
    }

    // Ensure title is within limit
    const title = parsed.title.length > 70 ? parsed.title.substring(0, 70) : parsed.title;
    
    // Ensure keywords is array and limit to 50
    const keywords = Array.isArray(parsed.keywords) 
      ? parsed.keywords.slice(0, 50).map(k => String(k).trim()).filter(k => k.length > 0)
      : [];

    return {
      title: title.trim(),
      keywords,
      category: String(parsed.category).trim()
    };
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
