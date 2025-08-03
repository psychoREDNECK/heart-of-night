import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

export function DiagnosticPage() {
  const [status, setStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: Record<string, any> = {};

      // Test API connection
      try {
        const healthResponse = await fetch('/api/health');
        const healthData = await healthResponse.json();
        results.apiHealth = { success: true, data: healthData };
      } catch (error) {
        results.apiHealth = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test projects endpoint
      try {
        const projectsResponse = await fetch('/api/projects');
        const projectsData = await projectsResponse.json();
        results.projects = { success: true, count: projectsData.length };
      } catch (error) {
        results.projects = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Test browser info
      results.browser = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        localStorage: typeof Storage !== 'undefined',
        cookies: navigator.cookieEnabled
      };

      // Test JavaScript execution
      results.javascript = { enabled: true, version: 'ES2022+' };

      setStatus(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center glitch">System Diagnostics</h1>
      
      {loading ? (
        <div className="text-center">Running diagnostics...</div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          <Card className="p-6 bg-black/80 border-green-500/30">
            <h2 className="text-xl font-semibold mb-4">API Health Check</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(status.apiHealth, null, 2)}
            </pre>
          </Card>

          <Card className="p-6 bg-black/80 border-green-500/30">
            <h2 className="text-xl font-semibold mb-4">Projects Endpoint</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(status.projects, null, 2)}
            </pre>
          </Card>

          <Card className="p-6 bg-black/80 border-green-500/30">
            <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(status.browser, null, 2)}
            </pre>
          </Card>

          <Card className="p-6 bg-black/80 border-green-500/30">
            <h2 className="text-xl font-semibold mb-4">JavaScript Status</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(status.javascript, null, 2)}
            </pre>
          </Card>

          <div className="mt-8 text-center">
            <a href="/" className="text-green-500 hover:text-green-400 underline">
              Return to Main App
            </a>
          </div>
        </div>
      )}
    </div>
  );
}