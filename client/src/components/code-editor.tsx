import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Play, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project, ProjectFile } from "@shared/schema";

interface CodeEditorProps {
  currentProject: Project | null;
  selectedFileId: string | null;
}

export default function CodeEditor({ currentProject, selectedFileId }: CodeEditorProps) {
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: file } = useQuery<ProjectFile>({
    queryKey: ["/api/files", selectedFileId],
    enabled: !!selectedFileId,
  });

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setHasChanges(false);
    }
  }, [file]);

  const saveFileMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFileId) throw new Error("No file selected");
      
      const response = await apiRequest("PUT", `/api/files/${selectedFileId}`, {
        content,
        size: content.length,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File saved successfully",
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", currentProject?.id, "files"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/files", selectedFileId] 
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive",
      });
    },
  });

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== file?.content);
  };

  const handleSave = () => {
    if (hasChanges) {
      saveFileMutation.mutate();
    }
  };

  const handleTest = () => {
    toast({
      title: "Test",
      description: "Code testing feature coming soon!",
    });
  };

  if (!currentProject || !selectedFileId || !file) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-slate-900">Code Editor</h3>
              <Badge variant="secondary">No file selected</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 text-green-400 font-mono text-sm rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
            <p className="text-slate-500">Select a file to start editing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-slate-900">Code Editor</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={hasChanges ? "destructive" : "secondary"}>
                {file.name}
                {hasChanges && " *"}
              </Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saveFileMutation.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              {saveFileMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
            >
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-slate-900 text-green-400 font-mono text-sm overflow-x-auto min-h-[300px]">
          <div className="flex">
            <div className="bg-slate-800 text-slate-400 text-right px-3 py-4 select-none">
              {content.split('\n').map((_, index) => (
                <div key={index + 1}>{index + 1}</div>
              ))}
            </div>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="bg-transparent border-0 text-green-400 font-mono resize-none focus:ring-0 focus:outline-none min-h-[300px] rounded-none"
                placeholder="# Start coding..."
                style={{ 
                  lineHeight: '1.5',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
