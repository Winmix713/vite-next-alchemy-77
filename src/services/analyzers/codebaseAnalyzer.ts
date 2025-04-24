
import { CodebaseAnalysis } from '@/types/analyzer';
import { analyzeCodeStructure } from '../astTransformer';

export async function analyzeCodebase(files: File[]): Promise<CodebaseAnalysis> {
  let reactComponents = 0;
  let hooks = 0;
  let apiRoutes = 0;
  let jsFiles = 0;
  let tsFiles = 0;
  let cssFiles = 0;
  const nextjsFeatureUsage: Record<string, number> = {
    'next/image': 0,
    'next/link': 0,
    'next/head': 0,
    'next/router': 0
  };

  for (const file of files) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) jsFiles++;
    else if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) tsFiles++;
    else if (fileName.endsWith('.css')) cssFiles++;
    
    if (fileName.includes('/api/')) apiRoutes++;
    
    const content = await readFileContent(file);
    
    if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
      try {
        // Use simplified analysis that doesn't rely on AST
        const analysis = analyzeCodeStructure(content);
        reactComponents += analysis.components.length;
        hooks += analysis.hooks.length;
        
        // Simple feature detection using string matching
        for (const feature of Object.keys(nextjsFeatureUsage)) {
          if (content.includes(feature)) {
            nextjsFeatureUsage[feature]++;
          }
        }
      } catch (error) {
        console.error(`Error analyzing ${fileName}:`, error);
      }
    }
  }

  return {
    totalFiles: files.length,
    jsFiles,
    tsFiles,
    reactComponents,
    hooks,
    cssFiles,
    apiRoutes,
    nextjsFeatureUsage
  };
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error("File reading error"));
    reader.readAsText(file);
  });
}
