import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface Config {
  llm_provider: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
}

const ConfigurationPanel: React.FC = () => {
  const [config, setConfig] = useState<Config>({
    llm_provider: 'openai',
    model_name: 'gpt-4',
    temperature: 0.0,
    max_tokens: 4000
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('http://127.0.0.1:8000/api/admin/config', config);
      alert('Configuration updated successfully');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>LLM Configuration</CardTitle>
              <CardDescription>Configure the language model settings</CardDescription>
            </div>
            <Button onClick={fetchConfig} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="llm_provider">LLM Provider</Label>
            <Select
              value={config.llm_provider}
              onValueChange={(value) => setConfig({ ...config, llm_provider: value })}
            >
              <SelectTrigger id="llm_provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the LLM provider for document processing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model_name">Model Name</Label>
            <Input
              id="model_name"
              value={config.model_name}
              onChange={(e) => setConfig({ ...config, model_name: e.target.value })}
              placeholder="e.g., gpt-4, claude-3-opus"
            />
            <p className="text-sm text-muted-foreground">
              Specific model to use (e.g., gpt-4, gpt-3.5-turbo, claude-3-opus-20240229)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">
              Controls randomness (0 = deterministic, 2 = very creative)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_tokens">Max Tokens</Label>
            <Input
              id="max_tokens"
              type="number"
              step="100"
              min="100"
              max="16000"
              value={config.max_tokens}
              onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">
              Maximum number of tokens in the response
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={fetchConfig}
              disabled={saving}
            >
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage API keys for LLM providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> API keys are configured in the backend .env file.
                For security reasons, they cannot be viewed or modified from the admin panel.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Current Provider</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {config.llm_provider.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Using {config.model_name}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function Badge({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${className || ''}`}>
      {children}
    </span>
  );
}

export default ConfigurationPanel;
