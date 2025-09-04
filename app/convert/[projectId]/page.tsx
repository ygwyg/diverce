'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProjectDetails {
  id: string;
  name: string;
  framework: string;
  gitRepository?: {
    type: string;
    repo: string;
    url: string;
    defaultBranch: string;
  };
  link?: {
    type: string;
    repo: string;
    repoId: number;
    org: string;
    gitCredentialId: string;
    productionBranch: string;
    createdAt: number;
    updatedAt: number;
    deployHooks: any[];
  };
  [key: string]: any; // To allow for any other fields
}

interface ConversionOptions {
  enableKVCache: boolean;
  kvNamespaceId: string;
  createBranch: boolean;
  branchName: string;
  commitAndPush: boolean;
  packageJsonPath: string;
}

interface ConversionStatus {
  status: 'idle' | 'cloning' | 'converting' | 'success' | 'failed';
  logs: string[];
  message?: string;
}

export default function ConvertProject() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  
  const [options, setOptions] = useState<ConversionOptions>({
    enableKVCache: false,
    kvNamespaceId: '',
    createBranch: true,
    branchName: 'cloudflare-migration',
    commitAndPush: false,
    packageJsonPath: '',
  });
  
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>({
    status: 'idle',
    logs: [],
  });

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch project details: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Project data:', data);
        setProject(data.project);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversionStatus.logs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const startConversion = async () => {
    setConversionStatus({
      status: 'cloning',
      logs: ['Starting conversion process...', 'Cloning repository...'],
    });
    
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          options,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`);
      }
      
      const eventSource = new EventSource(`/api/convert/status?projectId=${projectId}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        setConversionStatus(prev => ({
          ...prev,
          status: data.status,
          logs: [...data.logs],
          message: data.message,
        }));
        
        if (data.status === 'success' || data.status === 'failed') {
          eventSource.close();
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        setConversionStatus(prev => ({
          ...prev,
          status: 'failed',
          message: 'Lost connection to server',
        }));
      };
    } catch (err) {
      setConversionStatus({
        status: 'failed',
        logs: [...conversionStatus.logs, err instanceof Error ? err.message : 'An error occurred'],
        message: 'Conversion process failed',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground-secondary">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="bg-error-lighter p-6 rounded-cloudflare border border-error-light max-w-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-error mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-error mb-2">Error</h2>
          <p className="text-foreground-secondary mb-6">{error || 'Failed to load project details'}</p>
          <Link href="/dashboard" className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-foreground-secondary hover:text-foreground flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {project.name}
              <span className="badge badge-primary ml-3">{project.framework}</span>
            </h1>
            <p className="text-foreground-secondary mt-1">Migrating from Vercel to Cloudflare</p>
          </div>
          <div>
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className="btn-secondary text-xs"
            >
              {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {/* Project Info Card */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Project Details</h2>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-foreground-tertiary">Project ID</p>
                  <p className="text-foreground font-mono text-sm">{project.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-foreground-tertiary">Framework</p>
                  <p className="text-foreground">{project.framework}</p>
                </div>
              </div>
              
              {/* Git Repository Info */}
              {!project.gitRepository && !project.link ? (
                <div className="bg-warning-lighter p-4 rounded-cloudflare">
                  <h3 className="font-semibold text-warning-dark">No Git Repository</h3>
                  <p className="text-sm text-foreground-secondary mt-1">
                    This project doesn't have a connected Git repository.
                    This tool requires a Git repository to clone and modify the code.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Repository</h3>
                  {project.gitRepository ? (
                    <div className="space-y-2">
                      <p className="text-foreground">
                        <strong className="text-foreground-secondary">Repository:</strong> {project.gitRepository.repo}
                      </p>
                      <p className="text-foreground">
                        <strong className="text-foreground-secondary">Branch:</strong> {project.gitRepository.defaultBranch}
                      </p>
                    </div>
                  ) : project.link && project.link.type === 'github' ? (
                    <div className="space-y-2">
                      <p className="text-foreground">
                        <strong className="text-foreground-secondary">Repository:</strong> {project.link.org}/{project.link.repo}
                      </p>
                      <p className="text-foreground">
                        <strong className="text-foreground-secondary">Branch:</strong> {project.link.productionBranch}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
              
              {/* Debug Info */}
              {debugMode && (
                <div className="mt-4 border-t border-accents-2 pt-4">
                  <h3 className="font-semibold text-foreground mb-2">Raw Project Data</h3>
                  <div className="bg-accents-1 rounded-cloudflare p-3 overflow-auto max-h-60">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(project, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            {/* Conversion Options */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Conversion Options</h2>
              
              <form className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableKVCache"
                      name="enableKVCache"
                      checked={options.enableKVCache}
                      onChange={handleInputChange}
                      className="checkbox"
                    />
                    <label htmlFor="enableKVCache" className="ml-2 block text-foreground">
                      Enable KV Cache
                    </label>
                  </div>
                  <p className="text-sm text-foreground-tertiary ml-6">
                    Use Cloudflare KV for incremental static regeneration cache
                  </p>
                </div>
                
                {options.enableKVCache && (
                  <div className="ml-6 space-y-1">
                    <label htmlFor="kvNamespaceId" className="block text-foreground text-sm">
                      KV Namespace ID
                    </label>
                    <input
                      type="text"
                      id="kvNamespaceId"
                      name="kvNamespaceId"
                      value={options.kvNamespaceId}
                      onChange={handleInputChange}
                      placeholder="Enter your KV namespace ID"
                      className="input-field"
                    />
                      <a className="text-sm" href="https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces" target="_blank">Create a new KV namespace here</a>
                  </div>
                )}
                
                <div className="border-t border-accents-2 pt-4 mb-4">
                  <h3 className="font-semibold text-foreground mb-2">Project Options</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="packageJsonPath" className="block text-foreground text-sm">
                        Package.json Path (optional)
                      </label>
                      <input
                        type="text"
                        id="packageJsonPath"
                        name="packageJsonPath"
                        value={options.packageJsonPath}
                        onChange={handleInputChange}
                        placeholder="e.g., src"
                        className="input-field"
                      />
                      <p className="text-sm text-foreground-tertiary">
                        If package.json is not in the root, specify the subfolder (e.g., "src")
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-accents-2 pt-4">
                  <h3 className="font-semibold text-foreground mb-2">Git Options</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="createBranch"
                          name="createBranch"
                          checked={options.createBranch}
                          onChange={handleInputChange}
                          className="checkbox"
                        />
                        <label htmlFor="createBranch" className="ml-2 block text-foreground">
                          Create New Branch
                        </label>
                      </div>
                      <p className="text-sm text-foreground-tertiary ml-6">
                        Create a new branch for the Cloudflare migration
                      </p>
                    </div>
                    
                    {options.createBranch && (
                      <div className="ml-6 space-y-1">
                        <label htmlFor="branchName" className="block text-foreground text-sm">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          id="branchName"
                          name="branchName"
                          value={options.branchName}
                          onChange={handleInputChange}
                          placeholder="Branch name"
                          className="input-field"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="commitAndPush"
                          name="commitAndPush"
                          checked={options.commitAndPush}
                          onChange={handleInputChange}
                          className="checkbox"
                        />
                        <label htmlFor="commitAndPush" className="ml-2 block text-foreground">
                          Commit and Push Changes
                        </label>
                      </div>
                      <p className="text-sm text-foreground-tertiary ml-6">
                        Automatically commit and push the changes
                      </p>
                    </div>
                  </div>
                </div>
              
                <div className="pt-4">
                  {(project.gitRepository || (project.link && project.link.type === 'github')) && conversionStatus.status === 'idle' && (
                    <button
                      type="button"
                      onClick={startConversion}
                      className="btn-primary w-full"
                    >
                      Start Conversion
                    </button>
                  )}
                  
                  {!project.gitRepository && !project.link && (
                    <button
                      type="button"
                      disabled
                      className="btn-disabled w-full"
                    >
                      Git Repository Required
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {/* Conversion Status & Logs */}
            <div className="card h-full flex flex-col">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Conversion Status</h2>
                
                {conversionStatus.status !== 'idle' && (
                  <div className="flex items-center">
                    {conversionStatus.status === 'cloning' && (
                      <span className="badge bg-secondary text-white">Cloning Repository</span>
                    )}
                    {conversionStatus.status === 'converting' && (
                      <span className="badge bg-primary text-white">Converting</span>
                    )}
                    {conversionStatus.status === 'success' && (
                      <span className="badge badge-success">Completed</span>
                    )}
                    {conversionStatus.status === 'failed' && (
                      <span className="badge badge-error">Failed</span>
                    )}
                  </div>
                )}
              </div>
              
              {conversionStatus.status === 'idle' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-accents-2 rounded-cloudflare">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-accents-3 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Convert</h3>
                  <p className="text-foreground-secondary text-center max-w-md">
                    Configure the options and click "Start Conversion" to migrate your project from Vercel to Cloudflare
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="bg-accents-1 rounded-cloudflare p-4 h-96 overflow-auto flex-1 font-mono text-sm whitespace-pre-wrap">
                    {conversionStatus.logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log.startsWith('Error') || log.includes('failed') ? (
                          <span className="text-error">{log}</span>
                        ) : log.includes('✅') ? (
                          <span className="text-success">{log}</span>
                        ) : log.includes('WARNING') || log.includes('⚠️') ? (
                          <span className="text-warning">{log}</span>
                        ) : (
                          <span>{log}</span>
                        )}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                  
                  {conversionStatus.status === 'success' && (
                    <div className="mt-6 bg-success-lighter p-4 rounded-cloudflare border border-success-light">
                      <h3 className="font-semibold text-success-dark mb-2">Conversion Completed!</h3>
                      <p className="text-foreground-secondary mb-4">
                        Your Next.js project has been successfully converted to use Cloudflare. You can now deploy it to Cloudflare Workers.
                      </p>
                      {/* Add code snippet that clones the repository and runs npm run deploy */}
                      <pre className="bg-accents-1 rounded-cloudflare p-4 text-sm whitespace-pre-wrap relative mb-6">
                        <button 
                          onClick={() => {
                            const code = `git clone ${project.gitRepository.url}
cd ${project.gitRepository.repo.split('/').pop()}
npm install
npm run deploy`;
                            navigator.clipboard.writeText(code);
                          }}
                          className="absolute top-2 right-2 p-1 bg-accents-2 hover:bg-primary hover:text-white rounded-md text-xs transition-colors"
                          title="Copy to clipboard"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                        <code>
                          git clone {project.gitRepository.url}<br/>
                          cd {project.gitRepository.repo.split('/').pop()}<br/>
                          npm install<br/>
                          npm run deploy
                        </code>
                      </pre>
                      <div className="flex space-x-4">
                        <Link href="/dashboard" className="btn-secondary">
                          Back to Projects
                        </Link>
                        <button className="btn-primary">
                          Download Project
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {conversionStatus.status === 'failed' && (
                    <div className="mt-6 bg-error-lighter p-4 rounded-cloudflare border border-error-light">
                      <h3 className="font-semibold text-error-dark mb-2">Conversion Failed</h3>
                      <p className="text-foreground-secondary mb-4">
                        {conversionStatus.message || 'There was an error during the conversion process. Please check the logs for details.'}
                      </p>
                      <button 
                        onClick={() => setConversionStatus({ status: 'idle', logs: [] })}
                        className="btn-primary"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 