import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload } from "lucide-react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

interface FileUploadProps {
  currentProject: Project | null;
}

export default function FileUpload({ currentProject }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!currentProject) {
        throw new Error("No project selected");
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      return apiRequest("POST", `/api/projects/${currentProject.id}/files/upload`, formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (currentProject) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/projects", currentProject.id, "files"] 
        });
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!currentProject) {
        toast({
          title: "No Project Selected",
          description: "Please create or select a project first",
          variant: "destructive",
        });
        return;
      }

      const validFiles = acceptedFiles.filter(file => {
        const validExtensions = ['.py', '.pyw', '.zip'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        return validExtensions.includes(extension);
      });

      if (validFiles.length === 0) {
        toast({
          title: "Invalid Files",
          description: "Please upload only Python files (.py, .pyw) or ZIP archives",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      uploadMutation.mutate(validFiles);
    },
    [currentProject, uploadMutation, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python': ['.py', '.pyw'],
      'application/zip': ['.zip'],
    },
    multiple: true,
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Upload Python Files</CardTitle>
        <CardDescription>
          Upload your Python (.py) files to convert them into an APK
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50"
          } ${!currentProject ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} disabled={!currentProject} />
          <div className="mx-auto w-12 h-12 text-slate-400 mb-4">
            <CloudUpload className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {isDragActive ? "Drop files here" : "Drop your Python files here"}
          </h3>
          <p className="text-slate-600 mb-4">or click to browse files</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <span>Supported:</span>
            <span className="bg-slate-100 px-2 py-1 rounded">.py</span>
            <span className="bg-slate-100 px-2 py-1 rounded">.pyw</span>
            <span className="bg-slate-100 px-2 py-1 rounded">.zip</span>
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Uploading files...</span>
              <span className="text-sm text-slate-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
