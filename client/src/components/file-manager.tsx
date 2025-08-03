import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileCode, Folder, Search, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project, ProjectFile } from "@shared/schema";

interface FileManagerProps {
  currentProject: Project | null;
  selectedFileId: string | null;
  onFileSelect: (fileId: string | null) => void;
}

export default function FileManager({ 
  currentProject, 
  selectedFileId, 
  onFileSelect 
}: FileManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files = [] } = useQuery<ProjectFile[]>({
    queryKey: ["/api/projects", currentProject?.id, "files"],
    enabled: !!currentProject,
  });

  const createFileMutation = useMutation({
    mutationFn: async () => {
      if (!currentProject) throw new Error("No project selected");
      
      const fileData = {
        name: newFileName.endsWith('.py') ? newFileName : `${newFileName}.py`,
        content: newFileContent || "# New Python file\n\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()\n",
        type: "file" as const,
        size: newFileContent.length || 50,
      };
      
      const response = await apiRequest("POST", `/api/projects/${currentProject.id}/files`, fileData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File created successfully",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", currentProject?.id, "files"] 
      });
      setIsCreateDialogOpen(false);
      setNewFileName("");
      setNewFileContent("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest("DELETE", `/api/files/${fileId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", currentProject?.id, "files"] 
      });
      if (selectedFileId) {
        onFileSelect(null);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Error",
        description: "File name is required",
        variant: "destructive",
      });
      return;
    }
    createFileMutation.mutate();
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('/') || fileName.endsWith('/')) {
      return <Folder className="h-4 w-4 text-amber-500" />;
    }
    if (fileName.endsWith('.py') || fileName.endsWith('.pyw')) {
      return <FileCode className="h-4 w-4 text-primary" />;
    }
    return <FileCode className="h-4 w-4 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Files</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" disabled={!currentProject}>
              <Search className="h-4 w-4" />
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!currentProject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fileName">File Name</Label>
                    <Input
                      id="fileName"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="main.py"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fileContent">Initial Content (optional)</Label>
                    <Textarea
                      id="fileContent"
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      placeholder="# Your Python code here..."
                      rows={6}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateFile} 
                    disabled={createFileMutation.isPending}
                    className="w-full"
                  >
                    {createFileMutation.isPending ? "Creating..." : "Create File"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!currentProject ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">Select a project to view files</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No files in this project</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add File
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center space-x-3 p-2 rounded hover:bg-slate-50 cursor-pointer group ${
                  selectedFileId === file.id ? "bg-primary/5" : ""
                }`}
                onClick={() => onFileSelect(file.id)}
              >
                {getFileIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {file.type === 'folder' ? 'Folder' : 'File'} • {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFileMutation.mutate(file.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
