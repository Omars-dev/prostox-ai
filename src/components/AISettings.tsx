
import { useState } from 'react';
import { Settings, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AISettingsProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
];

export const AISettings = ({ selectedModel, onModelChange }: AISettingsProps) => {
  const [apiKeys, setApiKeys] = useState(() => {
    return JSON.parse(localStorage.getItem('prostoxai_api_keys') || '{}');
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const saveApiKey = (modelId: string, key: string) => {
    const updatedKeys = { ...apiKeys, [modelId]: key };
    setApiKeys(updatedKeys);
    localStorage.setItem('prostoxai_api_keys', JSON.stringify(updatedKeys));
    setTempKeys(prev => ({ ...prev, [modelId]: '' }));
    toast({
      title: "API Key Saved",
      description: `API key for ${AI_MODELS.find(m => m.id === modelId)?.name} has been saved.`,
    });
  };

  const removeApiKey = (modelId: string) => {
    const updatedKeys = { ...apiKeys };
    delete updatedKeys[modelId];
    setApiKeys(updatedKeys);
    localStorage.setItem('prostoxai_api_keys', JSON.stringify(updatedKeys));
    toast({
      title: "API Key Removed",
      description: `API key for ${AI_MODELS.find(m => m.id === modelId)?.name} has been removed.`,
    });
  };

  const toggleKeyVisibility = (modelId: string) => {
    setShowKeys(prev => ({ ...prev, [modelId]: !prev[modelId] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Configuration
          </h2>
          <p className="text-muted-foreground">
            Choose your AI model and manage API keys
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="glass">
              <Settings className="w-4 h-4 mr-2" />
              Manage API Keys
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl glass">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>API Key Management</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {AI_MODELS.map(model => (
                <Card key={model.id} className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{model.name}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {model.provider}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {apiKeys[model.id] ? (
                      <div className="space-y-2">
                        <Label>Current API Key</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type={showKeys[model.id] ? 'text' : 'password'}
                            value={apiKeys[model.id]}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(model.id)}
                          >
                            {showKeys[model.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeApiKey(model.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Add API Key</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="password"
                            placeholder={`Enter ${model.provider} API key...`}
                            value={tempKeys[model.id] || ''}
                            onChange={(e) => setTempKeys(prev => ({ 
                              ...prev, 
                              [model.id]: e.target.value 
                            }))}
                          />
                          <Button
                            size="sm"
                            onClick={() => saveApiKey(model.id, tempKeys[model.id] || '')}
                            disabled={!tempKeys[model.id]?.trim()}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="model-select" className="text-sm font-medium">
          AI Model:
        </Label>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger id="model-select" className="w-64 glass">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent className="glass bg-white/90 dark:bg-black/90 backdrop-blur-xl">
            {AI_MODELS.map(model => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{model.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {apiKeys[model.id] ? '✓' : '⚠️'}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {!apiKeys[selectedModel] && (
          <span className="text-sm text-orange-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            API key required
          </span>
        )}
      </div>
    </div>
  );
};
