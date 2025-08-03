import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Menu, Download, Share2 } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-slate-900">PyToApk</h1>
                {isMobile && (
                  <span className="text-xs text-white bg-primary px-2 py-1 rounded-full">
                    Mobile
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                v2.1.0
              </span>
            </div>
            
            {/* Mobile Actions */}
            {isMobile ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handleMobileShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleMobileDownload} disabled={!currentProject}>
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="#" className="text-slate-600 hover:text-slate-900 font-medium">
                    Projects
                  </a>
                  <a href="#" className="text-slate-600 hover:text-slate-900 font-medium">
                    Documentation
                  </a>
                  <a href="#" className="text-slate-600 hover:text-slate-900 font-medium">
                    Settings
                  </a>
                </nav>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
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

            {/* Code Editor */}
            <CodeEditor
              currentProject={currentProject}
              selectedFileId={selectedFileId}
            />

            {/* Build Process */}
            <BuildProcess currentProject={currentProject} />
          </div>
        </div>
      </div>
    </div>
  );
}
