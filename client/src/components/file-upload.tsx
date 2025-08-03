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

      const validExtensions = [
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

      const validFiles = acceptedFiles.filter(file => {
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        return validExtensions.includes(extension);
      });

      if (validFiles.length === 0) {
        toast({
          title: "Invalid Files",
          description: "Please upload supported file types: Python files, archives, documentation, config files, web assets, media files, etc.",
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
      'application/x-tar': ['.tar'],
      'application/gzip': ['.gz'],
      'text/plain': ['.txt', '.md', '.rst'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'application/x-yaml': ['.yml', '.yaml'],
      'text/javascript': ['.js'],
      'text/html': ['.html'],
      'text/css': ['.css'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
      'application/sql': ['.sql'],
      'application/x-sqlite3': ['.db']
    },
    multiple: true,
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Upload Project Files</CardTitle>
        <CardDescription>
          Upload your Python files, assets, configs, and other project files to convert them into an APK
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
            {isDragActive ? "Drop files here" : "Drop your project files here"}
          </h3>
          <p className="text-slate-600 mb-4">or click to browse files</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
            <span>Supported file types:</span>
            <div className="flex flex-wrap gap-1">
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.py</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.pyw</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.zip</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.txt</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.json</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.xml</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.md</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.png</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">.jpg</span>
              <span className="bg-slate-100 px-2 py-1 rounded text-xs">& more</span>
            </div>
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
