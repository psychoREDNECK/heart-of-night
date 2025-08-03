import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

interface AppConfigurationProps {
  currentProject: Project | null;
  onProjectUpdate: (project: Project) => void;
}

export default function AppConfiguration({ 
  currentProject, 
  onProjectUpdate 
}: AppConfigurationProps) {
  const [config, setConfig] = useState({
    name: "",
    packageName: "",
    version: "",
    targetSdk: "",
    entryPoint: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentProject) {
      setConfig({
        name: currentProject.name,
        packageName: currentProject.packageName,
        version: currentProject.version,
        targetSdk: currentProject.targetSdk,
        entryPoint: currentProject.entryPoint,
      });
    }
  }, [currentProject]);

  const updateProjectMutation = useMutation({
    mutationFn: async (updatedConfig: typeof config) => {
      if (!currentProject) throw new Error("No project selected");
      
      const response = await apiRequest("PUT", `/api/projects/${currentProject.id}`, updatedConfig);
      return response.json();
    },
    onSuccess: (updatedProject) => {
      toast({
        title: "Success",
        description: "Project configuration updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onProjectUpdate(updatedProject);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project configuration",
        variant: "destructive",
      });
    },
  });

  const handleConfigChange = (field: keyof typeof config, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    
    // Auto-save with debounce
    setTimeout(() => {
      if (currentProject) {
        updateProjectMutation.mutate(newConfig);
      }
    }, 1000);
  };

  if (!currentProject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary font-mono tracking-wider">[TARGET CONFIG]</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">Select a project to configure</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary font-mono tracking-wider">[TARGET CONFIG]</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="appName">App Name</Label>
          <Input
            id="appName"
            value={config.name}
            onChange={(e) => handleConfigChange("name", e.target.value)}
            placeholder="Weather App"
          />
        </div>
        
        <div>
          <Label htmlFor="packageName">Package Name</Label>
          <Input
            id="packageName"
            value={config.packageName}
            onChange={(e) => handleConfigChange("packageName", e.target.value)}
            placeholder="com.example.weatherapp"
          />
        </div>
        
        <div>
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={config.version}
            onChange={(e) => handleConfigChange("version", e.target.value)}
            placeholder="1.0.0"
          />
        </div>
        
        <div>
          <Label htmlFor="targetSdk">Target SDK</Label>
          <Select 
            value={config.targetSdk} 
            onValueChange={(value) => handleConfigChange("targetSdk", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target SDK" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Android 13 (API 33)">Android 13 (API 33)</SelectItem>
              <SelectItem value="Android 12 (API 31)">Android 12 (API 31)</SelectItem>
              <SelectItem value="Android 11 (API 30)">Android 11 (API 30)</SelectItem>
              <SelectItem value="Android 10 (API 29)">Android 10 (API 29)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="entryPoint">Entry Point</Label>
          <Input
            id="entryPoint"
            value={config.entryPoint}
            onChange={(e) => handleConfigChange("entryPoint", e.target.value)}
            placeholder="main.py"
          />
        </div>
      </CardContent>
    </Card>
  );
}
