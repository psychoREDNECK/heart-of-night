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
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  model: string;
  endpoint?: string;
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
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4',
    endpoint: ''
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
      // Check if API key is configured
      if (!aiConfig.apiKey) {
        throw new Error('AI API key not configured');
      }

      // Simulate AI response (replace with actual AI API call)
      const response = await simulateAIResponse(content, type, aiConfig);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
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

  const simulateAIResponse = async (content: string, type: 'chat' | 'code', config: AIConfig): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    if (type === 'code') {
      return `[CODE ANALYSIS COMPLETE]

ISSUES DETECTED:
- Line 3: Consider using list comprehension for better performance
- Line 7: Missing error handling for file operations
- Line 12: Variable name 'data' is too generic

SUGGESTED FIXES:
\`\`\`python
# Optimized version
result = [x for x in items if x.is_valid()]

# Add error handling
try:
    with open(filename, 'r') as file:
        content = file.read()
except FileNotFoundError:
    print(f"File {filename} not found")
\`\`\`

SECURITY ASSESSMENT:
✓ No obvious vulnerabilities detected
⚠ Recommend input validation for user data

Would you like me to explain any of these suggestions?`;
    }

    // General chat responses
    const responses = [
      "I'm here to help with your Python-to-APK development. What specific challenge are you facing?",
      "For hacking tools, consider implementing proper obfuscation techniques to avoid detection.",
      "Remember to test your payload thoroughly in a sandboxed environment before deployment.",
      "Need help with Android permissions? I can guide you through the manifest configuration.",
      "For better stealth, consider implementing anti-analysis techniques in your APK."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'chat' | 'code') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const content = type === 'chat' ? input : codeInput;
      sendMessage(content, type);
    }
  };

  const saveConfig = () => {
    if (!aiConfig.apiKey) {
      toast({
        title: "Configuration Error",
        description: "API key is required",
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
            <Badge variant={aiConfig.apiKey ? "default" : "destructive"} className="font-mono text-xs">
              {aiConfig.apiKey ? 'ONLINE' : 'OFFLINE'}
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
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="custom">Custom Endpoint</SelectItem>
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
                      placeholder="gpt-4"
                      className="font-mono"
                    />
                  </div>
                  {aiConfig.provider === 'custom' && (
                    <div className="grid gap-2">
                      <Label htmlFor="endpoint" className="font-mono">Endpoint URL</Label>
                      <Input
                        id="endpoint"
                        value={aiConfig.endpoint || ''}
                        onChange={(e) => setAiConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                        placeholder="https://api.example.com/v1"
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
                <Label className="font-mono text-primary tracking-wider">PASTE CODE FOR ANALYSIS</Label>
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