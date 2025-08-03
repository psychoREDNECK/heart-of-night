import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Terminal, Menu, Download, Share2, Zap, Shield, Code2, Eye, Bug } from "lucide-react";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/file-upload";
import ProjectSidebar from "@/components/project-sidebar";
import FileManager from "@/components/file-manager";
import AppConfiguration from "@/components/app-configuration";
import CodeEditor from "@/components/code-editor";
import BuildProcess from "@/components/build-process";
import AIAssistant from "@/components/ai-assistant";
import type { Project } from "@shared/schema";

export default function Home() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Check if running on mobile
  useEffect(() => {
    const checkPlatform = async () => {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        setIsMobile(info.platform === 'android' || info.platform === 'ios');
      }
    };
    checkPlatform();
  }, []);

  // Mobile-specific functionality
  const handleMobileShare = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: 'PyToApk Project',
          text: 'Check out my Python to APK conversion project!',
          url: window.location.href,
        });
      } catch (error) {
        toast({
          title: "Share Error",
          description: "Unable to share project",
          variant: "destructive",
        });
      }
    }
  };

  const handleMobileDownload = async () => {
    if (Capacitor.isNativePlatform() && currentProject) {
      try {
        // Simulate APK download to device storage
        await Filesystem.writeFile({
          path: `${currentProject.name}.apk`,
          data: `APK file for ${currentProject.name}`,
          directory: Directory.Documents,
        });
        
        toast({
          title: "Download Complete",
          description: `${currentProject.name}.apk saved to Documents`,
        });
      } catch (error) {
        toast({
          title: "Download Error",
          description: "Unable to save APK file",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      {/* Scanline Effect */}
      <div className="fixed top-0 left-0 w-full h-1 scanline z-50"></div>
      
      {/* Header */}
      <header className="bg-card border-b border-primary/20 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Terminal className="h-7 w-7 text-primary neon-glow" />
                  <Zap className="h-3 w-3 text-accent absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary glitch-text tracking-wider">
                    HEART OF NIGHT
                  </h1>
                  <div className="text-xs text-muted-foreground tracking-widest">
                    PYTHON WEAPONIZER v3.0
                  </div>
                </div>
                {isMobile && (
                  <span className="text-xs text-background bg-accent px-2 py-1 rounded font-mono font-bold">
                    MOBILE
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            {isMobile ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handleMobileShare} className="neon-glow hover:bg-primary/10">
                  <Share2 className="h-5 w-5 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleMobileDownload} disabled={!currentProject} className="neon-glow hover:bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="neon-glow hover:bg-primary/10">
                  <Menu className="h-5 w-5 text-primary" />
                </Button>
              </div>
            ) : (
              <>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="#" className="text-muted-foreground hover:text-primary font-mono text-sm tracking-wider transition-colors">
                    [TARGETS]
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary font-mono text-sm tracking-wider transition-colors">
                    [DOCS]
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary font-mono text-sm tracking-wider transition-colors">
                    [CONFIG]
                  </a>
                </nav>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="neon-glow hover:bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="neon-glow hover:bg-primary/10 md:hidden">
                    <Menu className="h-5 w-5 text-primary" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Sidebar - Collapsible on mobile */}
          <div className={isMobile ? 'w-full' : 'lg:col-span-1'}>
            <ProjectSidebar
              projects={projects}
              currentProject={currentProject}
              onProjectSelect={setCurrentProject}
            />
          </div>

          {/* Main Content */}
          <div className={isMobile ? 'w-full' : 'lg:col-span-3'}>
            {/* File Upload */}
            <FileUpload currentProject={currentProject} />

            {/* Project Structure & Configuration */}
            <div className={`grid gap-6 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
              <FileManager
                currentProject={currentProject}
                selectedFileId={selectedFileId}
                onFileSelect={setSelectedFileId}
              />
              <AppConfiguration
                currentProject={currentProject}
                onProjectUpdate={setCurrentProject}
              />
            </div>

            {/* Main Content Grid */}
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3'}`}>
              <div className={`space-y-6 ${isMobile ? 'col-span-1' : 'xl:col-span-2'}`}>
                {/* Code Editor */}
                {selectedFileId && currentProject && (
                  <CodeEditor
                    currentProject={currentProject}
                    selectedFileId={selectedFileId}
                  />
                )}

                {/* Build Process */}
                <BuildProcess currentProject={currentProject} />
              </div>
              
              {/* AI Assistant */}
              <div className={`${isMobile ? 'col-span-1' : 'xl:col-span-1'}`}>
                <AIAssistant 
                  currentProject={currentProject}
                  selectedFileId={selectedFileId}
                  onFileChange={() => {
                    // Refresh project data when AI makes changes
                    if (currentProject) {
                      // Force re-fetch of project files
                      window.location.reload();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
