import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

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
              </div>
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                v2.1.0
              </span>
            </div>
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProjectSidebar
              projects={projects}
              currentProject={currentProject}
              onProjectSelect={setCurrentProject}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* File Upload */}
            <FileUpload currentProject={currentProject} />

            {/* Project Structure & Configuration */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
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
