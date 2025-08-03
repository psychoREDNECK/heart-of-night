import { Request, Response } from 'express';

interface AIRequest {
  provider: 'openai' | 'anthropic' | 'llama-maverick' | 'custom';
  content: string;
  type: 'chat' | 'code';
  config: {
    apiKey?: string;
    model: string;
    endpoint?: string;
  };
}

export async function handleAIRequest(req: Request, res: Response) {
  try {
    const { provider, content, type, config }: AIRequest = req.body;

    if (!content || !provider) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const systemPrompt = type === 'code' 
      ? "You are a cybersecurity expert and Python specialist. Analyze code for vulnerabilities, performance issues, and provide secure implementation suggestions. Focus on Android APK development and hacking tools."
      : "You are an AI assistant specialized in cybersecurity, hacking tools, and Python-to-APK development. Use hacker terminology and provide expert advice.";

    let response: string;

    switch (provider) {
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
        return res.status(400).json({ error: 'Unknown AI provider' });
    }

    res.json({ response });
  } catch (error) {
    console.error('AI request error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'AI request failed' 
    });
  }
}

async function callLlamaMaverick(content: string, systemPrompt: string, config: any): Promise<string> {
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
    throw new Error(`LLaMA Maverick API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.response || data.content || 'No response from LLaMA Maverick';
}

async function callOpenAI(content: string, systemPrompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('OpenAI API key required');
  }

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
    throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response from OpenAI';
}

async function callAnthropic(content: string, systemPrompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('Anthropic API key required');
  }

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
    throw new Error(`Anthropic API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'No response from Anthropic';
}

async function callCustomEndpoint(content: string, systemPrompt: string, config: any): Promise<string> {
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
    throw new Error(`Custom API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.response || data.content || data.text || 'No response from custom AI';
}