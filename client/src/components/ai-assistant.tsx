import { useState } from "react";
import { Send, Bot, Code, MessageSquare, Settings, Zap, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeBlock?: string;
}

interface AIConfig {
  provider: 'openai' | 'anthropic' | 'llama-maverick' | 'custom';
  apiKey: string;
  model: string;
  endpoint?: string;
  customName?: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'AI Assistant initialized. Ready to help with code analysis and general assistance.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'llama-maverick',
    apiKey: '',
    model: 'maverick-4',
    endpoint: '',
    customName: 'LLaMA Maverick 4'
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (content: string, type: 'chat' | 'code' = 'chat') => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: type === 'code' ? `[CODE ANALYSIS REQUEST]\n${content}` : content,
      timestamp: new Date(),
      codeBlock: type === 'code' ? content : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setCodeInput('');
    setIsLoading(true);

    try {
      // Check if API key is configured (not required for LLaMA Maverick)
      if (!aiConfig.apiKey && aiConfig.provider !== 'llama-maverick') {
        throw new Error('AI API key not configured');
      }

      // Call the AI through backend
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: aiConfig.provider,
          content,
          type,
          config: aiConfig
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI request failed');
      }

      const data = await response.json();
      const aiResponse = data.response;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const callAI = async (content: string, type: 'chat' | 'code', config: AIConfig): Promise<string> => {
    const systemPrompt = type === 'code' 
      ? "You are a cybersecurity expert and Python specialist. Analyze code for vulnerabilities, performance issues, and provide secure implementation suggestions. Focus on Android APK development and hacking tools."
      : "You are an AI assistant specialized in cybersecurity, hacking tools, and Python-to-APK development. Use hacker terminology and provide expert advice.";

    try {
      let response;
      
      switch (config.provider) {
        case 'llama-maverick':
          response = await callLlamaMaverick(content, systemPrompt, config);
          break;
        case 'openai':
          response = await callOpenAI(content, systemPrompt, config);
          break;
        case 'anthropic':
          response = await callAnthropic(content, systemPrompt, config);
          break;
        case 'custom':
          response = await callCustomEndpoint(content, systemPrompt, config);
          break;
        default:
          throw new Error('Unknown AI provider');
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const callLlamaMaverick = async (content: string, systemPrompt: string, config: AIConfig): Promise<string> => {
    const endpoint = config.endpoint || 'http://localhost:11434/api/generate';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      body: JSON.stringify({
        model: config.model || 'maverick-4',
        prompt: `${systemPrompt}\n\nUser: ${content}\nAssistant:`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`LLaMA Maverick API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || data.content || 'No response from LLaMA Maverick';
  };

  const callOpenAI = async (content: string, systemPrompt: string, config: AIConfig): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from OpenAI';
  };

  const callAnthropic = async (content: string, systemPrompt: string, config: AIConfig): Promise<string> => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${content}` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response from Anthropic';
  };

  const callCustomEndpoint = async (content: string, systemPrompt: string, config: AIConfig): Promise<string> => {
    if (!config.endpoint) {
      throw new Error('Custom endpoint URL required');
    }

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      body: JSON.stringify({
        model: config.model,
        prompt: `${systemPrompt}\n\nUser: ${content}\nAssistant:`,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || data.content || data.text || 'No response from custom AI';
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'chat' | 'code') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const content = type === 'chat' ? input : codeInput;
      sendMessage(content, type);
    }
  };

  const saveConfig = () => {
    // LLaMA Maverick might not require API key if running locally
    if (!aiConfig.apiKey && aiConfig.provider !== 'llama-maverick') {
      toast({
        title: "Configuration Error",
        description: "API key is required for this provider",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('heart-of-night-ai-config', JSON.stringify(aiConfig));
    setIsConfigOpen(false);
    toast({
      title: "Configuration Saved",
      description: "AI assistant is now configured",
    });
  };

  // Load config on mount
  useState(() => {
    const saved = localStorage.getItem('heart-of-night-ai-config');
    if (saved) {
      try {
        setAiConfig(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load AI config:', error);
      }
    }
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary font-mono tracking-wider flex items-center gap-2">
            <Bot className="h-5 w-5 neon-glow" />
            [AI OPERATOR]
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={aiConfig.apiKey || aiConfig.provider === 'llama-maverick' ? "default" : "destructive"} className="font-mono text-xs">
              {(aiConfig.apiKey || aiConfig.provider === 'llama-maverick') ? 
                (aiConfig.provider === 'llama-maverick' ? 'MAVERICK-4' :
                 aiConfig.provider === 'openai' ? 'GPT-4' :
                 aiConfig.provider === 'anthropic' ? 'CLAUDE' :
                 aiConfig.customName || 'CUSTOM') : 'OFFLINE'}
            </Badge>
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="neon-glow hover:bg-primary/10">
                  <Settings className="h-4 w-4 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-primary font-mono tracking-wider">[AI CONFIG]</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="provider" className="font-mono">Provider</Label>
                    <Select value={aiConfig.provider} onValueChange={(value: any) => setAiConfig(prev => ({ ...prev, provider: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llama-maverick">LLaMA Maverick 4</SelectItem>
                        <SelectItem value="openai">OpenAI GPT</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        <SelectItem value="custom">Custom AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apiKey" className="font-mono">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="sk-..."
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model" className="font-mono">Model</Label>
                    <Input
                      id="model"
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                      placeholder={
                        aiConfig.provider === 'llama-maverick' ? 'maverick-4' :
                        aiConfig.provider === 'openai' ? 'gpt-4' :
                        aiConfig.provider === 'anthropic' ? 'claude-3-sonnet-20240229' :
                        'your-model'
                      }
                      className="font-mono"
                    />
                  </div>
                  {(aiConfig.provider === 'custom' || aiConfig.provider === 'llama-maverick') && (
                    <div className="grid gap-2">
                      <Label htmlFor="endpoint" className="font-mono">
                        {aiConfig.provider === 'llama-maverick' ? 'LLaMA Endpoint' : 'Custom Endpoint'}
                      </Label>
                      <Input
                        id="endpoint"
                        value={aiConfig.endpoint || ''}
                        onChange={(e) => setAiConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                        placeholder={
                          aiConfig.provider === 'llama-maverick' 
                            ? 'http://localhost:11434/api/generate' 
                            : 'https://api.example.com/v1'
                        }
                        className="font-mono"
                      />
                    </div>
                  )}
                  {aiConfig.provider === 'custom' && (
                    <div className="grid gap-2">
                      <Label htmlFor="customName" className="font-mono">AI Name</Label>
                      <Input
                        id="customName"
                        value={aiConfig.customName || ''}
                        onChange={(e) => setAiConfig(prev => ({ ...prev, customName: e.target.value }))}
                        placeholder="My Custom AI"
                        className="font-mono"
                      />
                    </div>
                  )}
                  <Button onClick={saveConfig} className="neon-glow font-mono">
                    SAVE CONFIG
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mb-2">
            <TabsTrigger value="chat" className="font-mono">
              <MessageSquare className="h-4 w-4 mr-2" />
              CHAT
            </TabsTrigger>
            <TabsTrigger value="code" className="font-mono">
              <Code className="h-4 w-4 mr-2" />
              CODE ANALYSIS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 font-mono text-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'system'
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground rounded-lg p-3 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 animate-pulse text-primary" />
                        Processing...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-primary/20">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'chat')}
                  placeholder="Ask AI for help..."
                  className="font-mono"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage(input, 'chat')}
                  disabled={isLoading || !input.trim()}
                  className="neon-glow"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 flex flex-col">
            <div className="flex-1 p-4 space-y-4">
              <div>
                <Label className="font-mono text-primary tracking-wider">
          DEPLOY CODE FOR {aiConfig.provider === 'llama-maverick' ? 'MAVERICK' : 'AI'} ANALYSIS
        </Label>
                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="# Paste your Python code here for analysis
def my_function():
    pass"
                  className="min-h-[200px] font-mono mt-2"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={() => sendMessage(codeInput, 'code')}
                disabled={isLoading || !codeInput.trim()}
                className="w-full neon-glow font-mono"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLoading ? 'ANALYZING...' : 'ANALYZE CODE'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}