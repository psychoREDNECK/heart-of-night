import { type Project, type InsertProject, type ProjectFile, type InsertProjectFile, type BuildLog, type InsertBuildLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Project Files
  getProjectFiles(projectId: string): Promise<ProjectFile[]>;
  getProjectFile(id: string): Promise<ProjectFile | undefined>;
  createProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  updateProjectFile(id: string, file: Partial<InsertProjectFile>): Promise<ProjectFile | undefined>;
  deleteProjectFile(id: string): Promise<boolean>;

  // Build Logs
  getBuildLog(projectId: string): Promise<BuildLog | undefined>;
  createBuildLog(log: InsertBuildLog): Promise<BuildLog>;
  updateBuildLog(projectId: string, log: Partial<InsertBuildLog>): Promise<BuildLog | undefined>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private projectFiles: Map<string, ProjectFile>;
  private buildLogs: Map<string, BuildLog>;

  constructor() {
    this.projects = new Map();
    this.projectFiles = new Map();
    this.buildLogs = new Map();
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      id,
      name: insertProject.name,
      packageName: insertProject.packageName,
      version: insertProject.version || "1.0.0",
      targetSdk: insertProject.targetSdk || "Android 13 (API 33)",
      entryPoint: insertProject.entryPoint || "main.py",
      createdAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = this.projects.delete(id);
    // Also delete associated files and build logs
    Array.from(this.projectFiles.entries()).forEach(([fileId, file]) => {
      if (file.projectId === id) {
        this.projectFiles.delete(fileId);
      }
    });
    this.buildLogs.delete(id);
    return deleted;
  }

  // Project Files
  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return Array.from(this.projectFiles.values())
      .filter(file => file.projectId === projectId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProjectFile(id: string): Promise<ProjectFile | undefined> {
    return this.projectFiles.get(id);
  }

  async createProjectFile(insertFile: InsertProjectFile): Promise<ProjectFile> {
    const id = randomUUID();
    const file: ProjectFile = { 
      id,
      projectId: insertFile.projectId,
      name: insertFile.name,
      content: insertFile.content,
      type: insertFile.type,
      size: insertFile.size || 0,
      createdAt: new Date()
    };
    this.projectFiles.set(id, file);
    return file;
  }

  async updateProjectFile(id: string, file: Partial<InsertProjectFile>): Promise<ProjectFile | undefined> {
    const existing = this.projectFiles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...file };
    this.projectFiles.set(id, updated);
    return updated;
  }

  async deleteProjectFile(id: string): Promise<boolean> {
    return this.projectFiles.delete(id);
  }

  // Build Logs
  async getBuildLog(projectId: string): Promise<BuildLog | undefined> {
    return this.buildLogs.get(projectId);
  }

  async createBuildLog(insertLog: InsertBuildLog): Promise<BuildLog> {
    const id = randomUUID();
    const log: BuildLog = { 
      id,
      projectId: insertLog.projectId,
      status: insertLog.status,
      progress: insertLog.progress || 0,
      logs: insertLog.logs || "",
      createdAt: new Date()
    };
    this.buildLogs.set(insertLog.projectId, log);
    return log;
  }

  async updateBuildLog(projectId: string, log: Partial<InsertBuildLog>): Promise<BuildLog | undefined> {
    const existing = this.buildLogs.get(projectId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...log };
    this.buildLogs.set(projectId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
