import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getDefaultVercelClient } from '../../lib/vercel-api';
import { cloneRepository, createBranch, commitAndPush } from '../../lib/git-utils';
import { ConversionPipeline, ConversionResult } from '../../lib/conversion-pipeline';

// Define global store for conversion status
declare global {
  var conversionStore: Record<string, {
    status: 'cloning' | 'converting' | 'success' | 'failed' | 'idle';
    logs: string[];
    message?: string;
    result?: ConversionResult;
    error?: string;
  }>;
}

// Initialize the global store if not exists
if (!global.conversionStore) {
  global.conversionStore = {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, options } = body;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Create an object to track conversion status
    global.conversionStore[projectId] = {
      status: 'cloning',
      logs: ['Initializing conversion process...'],
    };
    
    // Start the conversion process in the background
    startConversion(projectId, options);
    
    return NextResponse.json({
      success: true,
      message: 'Conversion process started',
    });
  } catch (error) {
    console.error('Error starting conversion:', error);
    return NextResponse.json(
      { error: 'Failed to start conversion process' },
      { status: 500 }
    );
  }
}

// Add a safer error handling utility
function safelyUpdateConversionStatus(projectId: string, status: 'cloning' | 'converting' | 'success' | 'failed', message: string, error?: any) {
  if (!global.conversionStore[projectId]) {
    global.conversionStore[projectId] = {
      status: 'idle',
      logs: [],
    };
  }
  
  // Update the status and message
  global.conversionStore[projectId].status = status;
  global.conversionStore[projectId].message = message;
  
  // Add to logs
  global.conversionStore[projectId].logs.push(message);
  
  // Log any errors
  if (error) {
    console.error(`Conversion error for ${projectId}:`, error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    global.conversionStore[projectId].logs.push(`Error details: ${errorMsg}`);
    global.conversionStore[projectId].error = errorMsg;
  }
}

async function startConversion(
  projectId: string,
  options: any
) {
  try {
    // Get project details from Vercel
    const client = getDefaultVercelClient();
    const project = await client.getProject(projectId);
    
    // Check for Git repository information in either gitRepository or link field
    const hasGitRepository = !!project.gitRepository;
    const hasLinkRepository = !!project.link && project.link.type === 'github';
    
    // Create gitRepository field from link if necessary
    if (!hasGitRepository && hasLinkRepository && project.link) {
      project.gitRepository = {
        type: project.link.type,
        repo: `${project.link.org}/${project.link.repo}`,
        url: `https://github.com/${project.link.org}/${project.link.repo}`,
        defaultBranch: project.link.productionBranch
      };
      global.conversionStore[projectId].logs.push(`Detected Git repository from link field: ${project.link.org}/${project.link.repo}`);
    }
    
    if (!project.gitRepository) {
      safelyUpdateConversionStatus(
        projectId,
        'failed',
        'No git repository found for this project',
        new Error('Project doesn\'t have a connected Git repository')
      );
      return;
    }
    
    // Update status
    global.conversionStore[projectId].logs.push(`Fetching project details for ${project.name}...`);
    global.conversionStore[projectId].logs.push(`Repository: ${project.gitRepository.repo}`);
    
    // Clone the repository
    const storagePath = process.env.LOCAL_STORAGE_PATH || './tmp/projects';
    // Vercel uses url for the git repository URL
    const repoUrl = project.gitRepository.url;
    const defaultBranch = project.gitRepository.defaultBranch;
    
    // Add detailed logging
    console.log('Repository URL details:');
    console.log('Raw URL from Vercel API:', repoUrl);
    console.log('URL type:', typeof repoUrl);
    console.log('Default branch:', defaultBranch);
    
    // Format URL for GitHub if needed
    let formattedRepoUrl = repoUrl;
    if (project.gitRepository.type === 'github' && !repoUrl.startsWith('https://') && !repoUrl.startsWith('git@')) {
      formattedRepoUrl = `https://github.com/${project.gitRepository.repo}.git`;
      console.log('Formatted GitHub URL:', formattedRepoUrl);
      global.conversionStore[projectId].logs.push(`Using formatted GitHub URL: ${formattedRepoUrl}`);
    }
    
    global.conversionStore[projectId].logs.push(`Cloning repository from ${formattedRepoUrl}...`);
    const cloneResult = await cloneRepository({
      repoUrl: formattedRepoUrl,
      projectId,
      branch: defaultBranch,
      storagePath,
    });
    
    if (!cloneResult.success) {
      safelyUpdateConversionStatus(
        projectId,
        'failed',
        `Failed to clone repository: ${cloneResult.message}`,
        cloneResult.error
      );
      return;
    }
    
    global.conversionStore[projectId].logs.push(cloneResult.message);
    global.conversionStore[projectId].status = 'converting';
    
    // Create a new branch if requested
    const projectPath = cloneResult.path;
    if (options.createBranch && options.branchName) {
      global.conversionStore[projectId].logs.push(`Creating branch: ${options.branchName}...`);
      const branchCreated = await createBranch(projectPath, options.branchName);
      
      if (!branchCreated) {
        global.conversionStore[projectId].logs.push(`Warning: Failed to create branch ${options.branchName}. Continuing on current branch.`);
      } else {
        global.conversionStore[projectId].logs.push(`Created branch: ${options.branchName}`);
      }
    }
    
    // Run the conversion pipeline
    global.conversionStore[projectId].logs.push('Starting conversion pipeline...');
    const pipeline = new ConversionPipeline({
      projectPath,
      projectName: project.name,
      enableKVCache: options.enableKVCache,
      kvNamespaceId: options.kvNamespaceId,
      packageJsonPath: options.packageJsonPath,
    });
    
    const result = await pipeline.run();
    global.conversionStore[projectId].logs.push(...result.logs);
    
    // Commit and push if requested
    if (result.success && options.commitAndPush) {
      global.conversionStore[projectId].logs.push('Committing and pushing changes...');
      const commitResult = await commitAndPush(projectPath, 'Convert to @opennextjs/cloudflare');
      
      if (commitResult) {
        global.conversionStore[projectId].logs.push('Changes committed and pushed successfully');
      } else {
        global.conversionStore[projectId].logs.push('Warning: Failed to commit and push changes');
      }
    }
    
    // Update final status
    global.conversionStore[projectId].status = result.success ? 'success' : 'failed';
    global.conversionStore[projectId].message = result.message;
    global.conversionStore[projectId].result = result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error during conversion of project ${projectId}:`, error);
    
    safelyUpdateConversionStatus(
      projectId,
      'failed',
      `Conversion process failed unexpectedly: ${errorMessage}`,
      error
    );
  }
} 