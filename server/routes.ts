import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertProjectFileSchema, insertBuildLogSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      '.py', '.pyw',           // Python files
      '.zip', '.tar', '.gz',   // Archives
      '.txt', '.md', '.rst',   // Documentation
      '.json', '.xml', '.yml', '.yaml', // Config files
      '.js', '.html', '.css',  // Web assets
      '.png', '.jpg', '.jpeg', '.gif', '.svg', // Images
      '.mp3', '.wav', '.ogg',  // Audio
      '.mp4', '.avi', '.mov',  // Video
      '.pdf', '.doc', '.docx', // Documents
      '.csv', '.tsv',          // Data files
      '.sql', '.db'            // Database files
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported. Supported types: Python files, archives, documentation, config files, web assets, media files, and more.`));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (increased for media files)
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project Files
  app.get("/api/projects/:projectId/files", async (req, res) => {
    try {
      const files = await storage.getProjectFiles(req.params.projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getProjectFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post("/api/projects/:projectId/files/upload", upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];
      for (const file of files) {
        // Determine if file content should be stored as text or binary
        const isBinaryFile = /\.(zip|tar|gz|png|jpg|jpeg|gif|svg|mp3|wav|ogg|mp4|avi|mov|pdf|doc|docx)$/i.test(file.originalname);
        
        let content: string;
        if (isBinaryFile) {
          content = `[BINARY FILE: ${file.originalname} - ${file.size} bytes]`;
        } else {
          try {
            content = file.buffer.toString('utf-8');
          } catch (error) {
            content = `[ENCODING ERROR: Unable to read ${file.originalname} as UTF-8]`;
          }
        }
        
        const fileData = {
          projectId: req.params.projectId,
          name: file.originalname,
          content,
          type: 'file' as const,
          size: file.size,
        };

        const validatedData = insertProjectFileSchema.parse(fileData);
        const createdFile = await storage.createProjectFile(validatedData);
        uploadedFiles.push(createdFile);
      }

      res.status(201).json(uploadedFiles);
    } catch (error) {
      console.error('File upload error:', error);
      res.status(400).json({ message: "Failed to upload files" });
    }
  });

  app.post("/api/projects/:projectId/files", async (req, res) => {
    try {
      const fileData = {
        ...req.body,
        projectId: req.params.projectId,
      };
      const validatedData = insertProjectFileSchema.parse(fileData);
      const file = await storage.createProjectFile(validatedData);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ message: "Invalid file data" });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    try {
      const validatedData = insertProjectFileSchema.partial().parse(req.body);
      const file = await storage.updateProjectFile(req.params.id, validatedData);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(400).json({ message: "Invalid file data" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProjectFile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Build Process
  app.post("/api/projects/:projectId/build", async (req, res) => {
    try {
      const projectId = req.params.projectId;
      
      // Create initial build log
      const buildLog = await storage.createBuildLog({
        projectId,
        status: 'building',
        progress: 0,
        logs: '[INFO] Starting build process...\n',
      });

      // Simulate build process
      setTimeout(async () => {
        await storage.updateBuildLog(projectId, {
          progress: 25,
          logs: buildLog.logs + '[INFO] Analyzing Python files...\n[INFO] Found entry point\n',
        });
      }, 1000);

      setTimeout(async () => {
        await storage.updateBuildLog(projectId, {
          progress: 50,
          logs: buildLog.logs + '[INFO] Installing dependencies...\n[INFO] Compiling Python bytecode...\n',
        });
      }, 2000);

      setTimeout(async () => {
        await storage.updateBuildLog(projectId, {
          progress: 75,
          logs: buildLog.logs + '[INFO] Creating Android project structure...\n[INFO] Packaging assets...\n',
        });
      }, 3000);

      setTimeout(async () => {
        await storage.updateBuildLog(projectId, {
          status: 'success',
          progress: 100,
          logs: buildLog.logs + '[INFO] Code signing...\n[SUCCESS] Build complete! APK ready for download.\n',
        });
      }, 4000);

      res.json(buildLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to start build process" });
    }
  });

  app.get("/api/projects/:projectId/build", async (req, res) => {
    try {
      const buildLog = await storage.getBuildLog(req.params.projectId);
      if (!buildLog) {
        return res.status(404).json({ message: "Build log not found" });
      }
      res.json(buildLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch build log" });
    }
  });

  // AI Code Editor endpoint
  app.post('/api/ai/edit', async (req, res) => {
    try {
      const { action, projectId, fileId, instructions, aiConfig } = req.body;

      if (!action || !instructions) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let response = '';
      let fileChanges = [];

      switch (action) {
        case 'read_project':
          const projectFiles = await storage.getProjectFiles(projectId);
          const fileContents = await Promise.all(
            projectFiles.map(async (file) => ({
              id: file.id,
              name: file.name,
              content: file.content,
              type: file.type
            }))
          );
          
          const systemPrompt = `You are an AI assistant that can edit code directly. You have access to the Heart of Night project files. 
Current project structure:
${fileContents.map(f => `- ${f.name} (${f.type})`).join('\n')}

When the user asks you to make changes:
1. Read and understand the current code
2. Make specific, targeted changes
3. Respond with the changes made and reasoning
4. Use proper error handling and maintain code quality`;

          response = await callAIWithContext(instructions, systemPrompt, fileContents, aiConfig);
          break;

        case 'edit_file':
          const targetFile = await storage.getProjectFile(fileId);
          if (!targetFile) {
            return res.status(404).json({ error: 'File not found' });
          }

          const editPrompt = `You are editing the file "${targetFile.name}" in the Heart of Night project.
Current file content:
\`\`\`${targetFile.type}
${targetFile.content}
\`\`\`

User request: ${instructions}

Provide the complete updated file content. Maintain proper formatting and syntax.`;

          const newContent = await callAIWithContext(editPrompt, '', [], aiConfig);
          
          // Update the file
          await storage.updateProjectFile(fileId, { content: newContent });
          
          response = `File "${targetFile.name}" updated successfully. Changes made: ${instructions}`;
          fileChanges.push({
            fileId,
            fileName: targetFile.name,
            action: 'modified'
          });
          break;

        case 'create_file':
          const project = await storage.getProject(projectId);
          if (!project) {
            return res.status(404).json({ error: 'Project not found' });
          }

          const createPrompt = `Create a new file for the Heart of Night project.
User request: ${instructions}

Provide:
1. Suggested filename with extension
2. Complete file content
3. Brief description of what the file does

Format your response as:
FILENAME: [filename]
DESCRIPTION: [description]
CONTENT:
[file content]`;

          const createResponse = await callAIWithContext(createPrompt, '', [], aiConfig);
          
          // Parse AI response to extract filename and content
          const filenameMatch = createResponse.match(/FILENAME:\s*(.+)/);
          const contentMatch = createResponse.match(/CONTENT:\s*([\s\S]+)/);
          
          if (filenameMatch && contentMatch) {
            const filename = filenameMatch[1].trim();
            const content = contentMatch[1].trim();
            
            const newFile = await storage.createProjectFile({
              projectId,
              name: filename,
              content,
              type: getFileType(filename)
            });
            
            response = `Created new file "${filename}". ${createResponse}`;
            fileChanges.push({
              fileId: newFile.id,
              fileName: filename,
              action: 'created'
            });
          } else {
            response = createResponse;
          }
          break;

        default:
          return res.status(400).json({ error: 'Unknown action' });
      }

      res.json({ response, fileChanges });
    } catch (error) {
      console.error('AI edit error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'AI edit request failed' 
      });
    }
  });

  // AI Assistant endpoint
  app.post('/api/ai', async (req, res) => {
    try {
      const { provider, content, type, config } = req.body;

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
        case 'mistral':
          response = await callMistral(content, systemPrompt, config);
          break;
        case 'ollama':
          response = await callOllama(content, systemPrompt, config);
          break;
        case 'together':
          response = await callTogether(content, systemPrompt, config);
          break;
        case 'openai':
          if (type === 'image') {
            const imageUrl = await generateImageOpenAI(content, config);
            return res.json({ response: 'Image generated successfully', imageUrl });
          }
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
  });

  const httpServer = createServer(app);
  return httpServer;
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

async function callMistral(content: string, systemPrompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('Mistral API key required');
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response from Mistral';
}

async function callOllama(content: string, systemPrompt: string, config: any): Promise<string> {
  const endpoint = config.endpoint || 'http://localhost:11434/api/generate';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model || 'llama2-uncensored',
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
    throw new Error(`Ollama API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.response || data.content || 'No response from Ollama';
}

async function callTogether(content: string, systemPrompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('Together AI API key required');
  }

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Together AI API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response from Together AI';
}

async function generateImageOpenAI(prompt: string, config: any): Promise<string> {
  if (!config.apiKey) {
    throw new Error('OpenAI API key required for image generation');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI Image API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.data[0]?.url || '';
}

async function callAIWithContext(prompt: string, systemPrompt: string, fileContents: any[], config: any): Promise<string> {
  const contextualPrompt = fileContents.length > 0 
    ? `${prompt}\n\nProject Files Context:\n${fileContents.map(f => `=== ${f.name} ===\n${f.content}\n`).join('\n')}`
    : prompt;

  switch (config.provider) {
    case 'mistral':
      return await callMistral(contextualPrompt, systemPrompt, config);
    case 'llama-maverick':
      return await callLlamaMaverick(contextualPrompt, systemPrompt, config);
    case 'ollama':
      return await callOllama(contextualPrompt, systemPrompt, config);
    case 'together':
      return await callTogether(contextualPrompt, systemPrompt, config);
    case 'openai':
      return await callOpenAI(contextualPrompt, systemPrompt, config);
    case 'anthropic':
      return await callAnthropic(contextualPrompt, systemPrompt, config);
    case 'custom':
      return await callCustomEndpoint(contextualPrompt, systemPrompt, config);
    default:
      throw new Error('Unknown AI provider');
  }
}

function getFileType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const typeMap: { [key: string]: string } = {
    'py': 'python',
    'pyw': 'python',
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'txt': 'text',
    'xml': 'xml',
    'yml': 'yaml',
    'yaml': 'yaml'
  };
  return typeMap[ext || ''] || 'text';
}
