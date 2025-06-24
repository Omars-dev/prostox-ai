import { useState } from 'react';
import { Settings, Key, Eye, EyeOff, AlertCircle, Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
interface APIKey {
  id: string;
  nickname: string;
  key: string;
  model: string;
  lastUsed: string;
  requestsMade: number;
  isActive: boolean;
  createdAt: string;
}
interface AISettingsProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}
const AI_MODELS = [{
  id: 'gemini-2.0-flash',
  name: 'Gemini 2.0 Flash',
  provider: 'Google'
}, {
  id: 'claude-3-5-sonnet',
  name: 'Claude 3.5 Sonnet',
  provider: 'Anthropic'
}, {
  id: 'gpt-4o',
  name: 'GPT-4o',
  provider: 'OpenAI'
}, {
  id: 'gpt-4o-mini',
  name: 'GPT-4o Mini',
  provider: 'OpenAI'
}];
export const AISettings = ({
  selectedModel,
  onModelChange
}: AISettingsProps) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(() => {
    const stored = localStorage.getItem('prostoxai_api_keys_v2');
    return stored ? JSON.parse(stored) : [];
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState({
    nickname: '',
    key: '',
    model: selectedModel
  });
  const [isAddingKey, setIsAddingKey] = useState(false);
  const {
    toast
  } = useToast();
  const saveApiKeys = (keys: APIKey[]) => {
    setApiKeys(keys);
    localStorage.setItem('prostoxai_api_keys_v2', JSON.stringify(keys));
  };
  const addApiKey = () => {
    if (!newKey.nickname.trim() || !newKey.key.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both nickname and API key.",
        variant: "destructive"
      });
      return;
    }
    const apiKey: APIKey = {
      id: crypto.randomUUID(),
      nickname: newKey.nickname.trim(),
      key: newKey.key.trim(),
      model: newKey.model,
      lastUsed: 'Never',
      requestsMade: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const updatedKeys = [...apiKeys, apiKey];
    saveApiKeys(updatedKeys);
    setNewKey({
      nickname: '',
      key: '',
      model: selectedModel
    });
    setIsAddingKey(false);
    toast({
      title: "API Key Added",
      description: `${apiKey.nickname} has been added successfully.`
    });
  };
  const removeApiKey = (id: string) => {
    const updatedKeys = apiKeys.filter(key => key.id !== id);
    saveApiKeys(updatedKeys);
    toast({
      title: "API Key Removed",
      description: "API key has been removed successfully."
    });
  };
  const toggleKeyStatus = (id: string) => {
    const updatedKeys = apiKeys.map(key => key.id === id ? {
      ...key,
      isActive: !key.isActive
    } : key);
    saveApiKeys(updatedKeys);
  };
  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const getActiveKeysForModel = (model: string) => {
    return apiKeys.filter(key => key.model === model && key.isActive);
  };
  const formatDate = (dateString: string) => {
    if (dateString === 'Never') return 'Never';
    return new Date(dateString).toLocaleDateString();
  };
  return <div className="space-y-6">
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
            <Button variant="outline" className="liquid-button px-4 py-2 font-semibold relative z-10">
              <Settings className="w-4 h-4 mr-2" />
              <span className="relative z-10">API Key Manager</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="liquid-glass max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-enhanced">
                <Key className="w-5 h-5" />
                <span>API Key Management</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Your API Keys Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-enhanced">Your API Keys</h3>
                  <Button onClick={() => setIsAddingKey(true)} className="liquid-button bg-blue-900 hover:bg-blue-800 text-slate-50 px-4 py-2 relative z-10">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="relative z-10">Add New API Key</span>
                  </Button>
                </div>

                {apiKeys.length === 0 ? <Card className="liquid-glass">
                    <CardContent className="p-6 text-center text-muted-foreground text-enhanced">
                      No API keys added yet. Add your first API key to get started.
                    </CardContent>
                  </Card> : <div className="space-y-3">
                    {apiKeys.map(apiKey => <Card key={apiKey.id} className="liquid-glass">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-medium text-enhanced">{apiKey.nickname}</h4>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  {AI_MODELS.find(m => m.id === apiKey.model)?.name || apiKey.model}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {apiKey.isActive ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                                  <span className={`text-xs ${apiKey.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                    {apiKey.isActive ? 'Active' : 'Deactivated'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground text-enhanced">
                                <span>Last used: {formatDate(apiKey.lastUsed)}</span>
                                <span>Requests: {apiKey.requestsMade}</span>
                                <span>Added: {formatDate(apiKey.createdAt)}</span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Input type={showKeys[apiKey.id] ? 'text' : 'password'} value={apiKey.key} readOnly className="font-mono text-sm flex-1 liquid-glass" />
                                <Button size="icon" variant="ghost" onClick={() => toggleKeyVisibility(apiKey.id)} className="liquid-button relative z-10">
                                  {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              <Switch checked={apiKey.isActive} onCheckedChange={() => toggleKeyStatus(apiKey.id)} />
                              <Button size="icon" variant="destructive" onClick={() => removeApiKey(apiKey.id)} className="liquid-button relative z-10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div>}
              </div>

              {/* Add New API Key Form */}
              {isAddingKey && <Card className="liquid-glass border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-enhanced">Add New API Key</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-enhanced">Nickname</Label>
                        <Input placeholder="e.g., Main, Backup" value={newKey.nickname} onChange={e => setNewKey(prev => ({
                      ...prev,
                      nickname: e.target.value
                    }))} className="liquid-glass" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-enhanced">AI Model</Label>
                        <Select value={newKey.model} onValueChange={value => setNewKey(prev => ({
                      ...prev,
                      model: value
                    }))}>
                          <SelectTrigger className="liquid-glass">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="liquid-glass">
                            {AI_MODELS.map(model => <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-enhanced">API Key</Label>
                      <Input type="password" placeholder="Paste your API key here..." value={newKey.key} onChange={e => setNewKey(prev => ({
                    ...prev,
                    key: e.target.value
                  }))} className="liquid-glass" />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={addApiKey} className="liquid-button relative z-10">
                        <span className="relative z-10">Add Key</span>
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingKey(false)} className="liquid-button relative z-10">
                        <span className="relative z-10">Cancel</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>}

              {/* Helper Guide */}
              <Card className="liquid-glass bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardHeader>
                  <CardTitle className="text-lg text-enhanced">How to get your API key:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-medium text-enhanced">For Google Gemini:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li className="text-enhanced">Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Google AI Studio <ExternalLink className="w-3 h-3 ml-1" /></a></li>
                      <li className="text-enhanced">Sign in with your Google account</li>
                      <li className="text-enhanced">Click "Create API Key"</li>
                      <li className="text-enhanced">Copy & paste the key into the box above</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium text-enhanced">For Other Providers:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li className="text-enhanced"><strong>OpenAI:</strong> Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a></li>
                      <li className="text-enhanced"><strong>Anthropic:</strong> Visit <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic Console</a></li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md liquid-glass">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 text-enhanced">
                      💡 <strong>Tip:</strong> Add multiple API keys to avoid rate limiting during bulk processing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="model-select" className="text-sm font-medium text-enhanced">
          AI Model:
        </Label>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger id="model-select" className="w-64 liquid-glass">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent className="liquid-glass bg-white/90 dark:bg-black/90 backdrop-blur-xl">
            {AI_MODELS.map(model => {
            const activeKeys = getActiveKeysForModel(model.id);
            return <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-enhanced">{model.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {activeKeys.length > 0 ? `✓ ${activeKeys.length}` : '⚠️'}
                    </span>
                  </div>
                </SelectItem>;
          })}
          </SelectContent>
        </Select>
        
        {getActiveKeysForModel(selectedModel).length === 0 && <span className="text-sm text-orange-500 flex items-center text-enhanced">
            <AlertCircle className="w-4 h-4 mr-1" />
            API key required
          </span>}
      </div>
    </div>;
};
