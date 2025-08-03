import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Folder, FolderOpen, Upload, Download, Settings, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

interface ProjectSidebarProps {
  projects: Project[];
  currentProject: Project | null;
  onProjectSelect: (project: Project | null) => void;
}

export default function ProjectSidebar({ 
  projects, 
  currentProject, 
  onProjectSelect 
}: ProjectSidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      const projectData = {
        name,
        packageName: `com.example.${name.toLowerCase().replace(/\s+/g, '')}`,
        version: "1.0.0",
        targetSdk: "Android 13 (API 33)",
        entryPoint: "main.py",
      };
      
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: (newProject) => {
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onProjectSelect(newProject);
      setIsCreateDialogOpen(false);
      setNewProjectName("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(newProjectName.trim());
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "1 day ago";
    return d.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Navigator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Project */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Current Project</span>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <Button 
                    onClick={handleCreateProject} 
                    disabled={createProjectMutation.isPending}
                    className="w-full"
                  >
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {currentProject ? (
            <div className="bg-slate-50 rounded-lg p-3 border-2 border-primary/20">
              <div className="flex items-center space-x-2">
                <Folder className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">{currentProject.name}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Created {formatDate(currentProject.createdAt)}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-3 border-2 border-dashed border-slate-300">
              <div className="text-center">
                <p className="text-sm text-slate-500">No project selected</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Recent Projects</h3>
          <div className="space-y-2">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className={`flex items-center space-x-2 p-2 rounded hover:bg-slate-50 cursor-pointer ${
                  currentProject?.id === project.id ? "bg-primary/5" : ""
                }`}
                onClick={() => onProjectSelect(project)}
              >
                <FolderOpen className="h-3 w-3 text-slate-400" />
                <span className="text-sm text-slate-600 truncate">{project.name}</span>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No projects yet. Create your first project!
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-slate-600 hover:text-slate-900"
              disabled={!currentProject}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Files
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-slate-600 hover:text-slate-900"
              disabled={!currentProject}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Project
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-slate-600 hover:text-slate-900"
              disabled={!currentProject}
            >
              <Settings className="h-4 w-4 mr-2" />
              Build Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
