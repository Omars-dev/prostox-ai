import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AISettingsProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

interface ApiKey {
  id: string;
  model: string;
  key: string;
  name?: string;
  isActive: boolean;
  lastUsed?: string;
  requestsMade: number;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gpt-3.5-turbo', name: 'GPT 3.5 Turbo' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
];

export const AISettings = ({ selectedModel, onModelChange }: AISettingsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState({ model: '', key: '', name: '' });
  const { toast } = useToast();

  useEffect(() => {
    const storedKeys = localStorage.getItem('prostoxai_api_keys_v2');
    if (storedKeys) {
      setApiKeys(JSON.parse(storedKeys));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('prostoxai_api_keys_v2', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const handleAddKey = () => {
    if (!newKey.model || !newKey.key) {
      toast({
        title: "Missing fields",
        description: "Please select a model and enter an API key.",
        variant: "destructive",
      });
      return;
    }

    const newApiKey: ApiKey = {
      id: crypto.randomUUID(),
      model: newKey.model,
      key: newKey.key,
      name: newKey.name,
      isActive: false,
      requestsMade: 0,
    };

    setApiKeys(prev => [...prev, newApiKey]);
    setNewKey({ model: '', key: '', name: '' });
    toast({
      title: "API Key Added",
      description: "New API key has been added.",
    });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    toast({
      title: "API Key Deleted",
      description: "API key has been deleted.",
    });
  };

  const handleSetActive = (id: string) => {
    setApiKeys(prev =>
      prev.map(key => ({
        ...key,
        isActive: key.id === id,
      }))
    );
    toast({
      title: "API Key Activated",
      description: "API key has been set as active.",
    });
  };

  return (
    <div className="cta-animated">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-enhanced mb-1">AI Configuration</h2>
          <p className="text-muted-foreground text-sm">Configure your AI model and API keys</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-enhanced whitespace-nowrap">Model:</label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-[180px] liquid-glass border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="liquid-button font-semibold border-2 border-blue-300 hover:border-blue-400 relative z-10"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="text-enhanced">Manage API Keys</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-top-positioned modal-content-scrollable">
              <DialogHeader>
                <DialogTitle className="text-enhanced">API Key Management</DialogTitle>
                <DialogDescription>
                  Manage your API keys for different AI models. You can add multiple keys per model and switch between them.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Add New API Key */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-enhanced">Add New API Key</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-enhanced">Model</label>
                      <Select value={newKey.model} onValueChange={(value) => setNewKey({...newKey, model: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_MODELS.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-enhanced">Name (Optional)</label>
                      <Input
                        placeholder="e.g., Main Key, Backup Key"
                        value={newKey.name}
                        onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-enhanced">API Key</label>
                    <Input
                      type="password"
                      placeholder="Enter your API key"
                      value={newKey.key}
                      onChange={(e) => setNewKey({...newKey, key: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleAddKey} 
                    disabled={!newKey.model || !newKey.key}
                    className="liquid-button font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="text-enhanced">Add API Key</span>
                  </Button>
                </div>

                {/* Existing API Keys */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-enhanced">Your API Keys</h3>
                  {apiKeys.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No API keys added yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="flex items-center justify-between p-3 border rounded-lg liquid-glass">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-enhanced">
                                {AVAILABLE_MODELS.find(m => m.id === apiKey.model)?.name || apiKey.model}
                              </span>
                              {apiKey.isActive && (
                                <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  Active
                                </Badge>
                              )}
                            </div>
                            {apiKey.name && (
                              <p className="text-sm text-muted-foreground">{apiKey.name}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Key: {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 4)}
                            </p>
                            {apiKey.lastUsed && (
                              <p className="text-xs text-muted-foreground">
                                Last used: {new Date(apiKey.lastUsed).toLocaleDateString()} | 
                                Requests: {apiKey.requestsMade}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!apiKey.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetActive(apiKey.id)}
                                className="text-xs"
                              >
                                Set Active
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteKey(apiKey.id)}
                              className="text-destructive hover:text-destructive text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-enhanced">How to get API Keys:</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      <strong>Google Gemini:</strong>
                      <p>1. Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a></p>
                      <p>2. Sign in with your Google account</p>
                      <p>3. Click "Create API Key" and copy the generated key</p>
                    </div>
                    <div>
                      <strong>OpenAI GPT:</strong>
                      <p>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI Platform</a></p>
                      <p>2. Sign in to your OpenAI account</p>
                      <p>3. Click "Create new secret key" and copy the generated key</p>
                    </div>
                    <div>
                      <strong>Anthropic Claude:</strong>
                      <p>1. Go to <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Anthropic Console</a></p>
                      <p>2. Sign in to your Anthropic account</p>
                      <p>3. Navigate to API Keys and create a new key</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
