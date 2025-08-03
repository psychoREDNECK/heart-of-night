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

  const httpServer = createServer(app);
  return httpServer;
}
