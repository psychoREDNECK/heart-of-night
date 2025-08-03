import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Hammer, Eye, CheckCircle, Clock, Loader2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project, BuildLog } from "@shared/schema";

interface BuildProcessProps {
  currentProject: Project | null;
}

interface BuildStep {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export default function BuildProcess({ currentProject }: BuildProcessProps) {
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([
    {
      name: "File Validation",
      description: "Validating Python files and dependencies",
      status: 'pending'
    },
    {
      name: "Dependency Analysis",
      description: "Analyzing project dependencies",
      status: 'pending'
    },
    {
      name: "Building APK",
      description: "Compiling Python code and packaging resources",
      status: 'pending'
    },
    {
      name: "Code Signing",
      description: "Signing APK for distribution",
      status: 'pending'
    }
  ]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: buildLog, refetch: refetchBuildLog } = useQuery<BuildLog>({
    queryKey: ["/api/projects", currentProject?.id, "build"],
    enabled: !!currentProject,
    refetchInterval: (query) => {
      return query.state.data?.status === 'building' ? 1000 : false;
    },
  });

  const startBuildMutation = useMutation({
    mutationFn: async () => {
      if (!currentProject) throw new Error("No project selected");
      
      const response = await apiRequest("POST", `/api/projects/${currentProject.id}/build`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Build Started",
        description: "APK build process has been initiated",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", currentProject?.id, "build"] 
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start build process",
        variant: "destructive",
      });
    },
  });

  // Update build steps based on progress
  useEffect(() => {
    if (!buildLog) return;

    setBuildSteps(prev => prev.map((step, index) => {
      const progressThresholds = [25, 50, 75, 100];
      const threshold = progressThresholds[index];
      
      if (buildLog.progress >= threshold) {
        return { ...step, status: 'completed' };
      } else if (buildLog.progress >= (progressThresholds[index - 1] || 0)) {
        return { ...step, status: 'running' };
      }
      return { ...step, status: 'pending' };
    }));
  }, [buildLog]);

  const getStepIcon = (status: BuildStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <div className="h-4 w-4 bg-red-600 rounded-full" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleStartBuild = () => {
    startBuildMutation.mutate();
  };

  const handlePreview = () => {
    toast({
      title: "Preview",
      description: "APK preview feature coming soon!",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download",
      description: "APK download started!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary font-mono tracking-wider">[APK COMPILER]</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleStartBuild}
              disabled={!currentProject || buildLog?.status === 'building' || startBuildMutation.isPending}
              className="bg-primary hover:bg-primary/90 neon-glow font-mono"
            >
              <Hammer className="h-4 w-4 mr-2" />
              {buildLog?.status === 'building' ? '>>> COMPILING <<<' : '>>> EXECUTE <<<'}
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!currentProject}
              className="border-primary/30 text-primary hover:bg-primary/10 font-mono"
            >
              <Eye className="h-4 w-4 mr-2" />
              PREVIEW
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!currentProject ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">Select a project to start building</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Build Steps */}
            <div className="space-y-3">
              {buildSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{step.name}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {buildLog && (
              <div className="space-y-2">
                <Progress value={buildLog.progress} className="w-full" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>{buildLog.progress}%</span>
                </div>
              </div>
            )}

            {/* Build Output Terminal */}
            <div className="bg-slate-900 rounded-lg p-4 text-green-400 font-mono text-xs overflow-x-auto h-32 overflow-y-auto">
              {buildLog?.logs ? (
                <div className="whitespace-pre-wrap">
                  {buildLog.logs}
                  {buildLog.status === 'building' && (
                    <div className="animate-pulse">_</div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500">
                  Build output will appear here...
                </div>
              )}
            </div>

            {/* Download Section */}
            {buildLog?.status === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <Download className="h-4 w-4 text-green-600" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-900">Build Complete!</h4>
                    <p className="text-sm text-green-700">Your APK is ready for download</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleDownload}
                  >
                    Download APK
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {buildLog?.status === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>
                  Build failed. Please check your code and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
