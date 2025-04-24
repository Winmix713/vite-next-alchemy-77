
import { analyzeCodeStructure } from '../astTransformer';

export interface ComponentAnalysis {
  components: number;
  hooks: number;
  nextFeatures: Record<string, number>;
}

export async function analyzeComponents(files: File[]): Promise<ComponentAnalysis> {
  let components = 0;
  let hooks = 0;
  const nextFeatures: Record<string, number> = {
    'next/image': 0,
    'next/link': 0,
    'next/head': 0,
    'next/router': 0
  };
  
  for (const file of files) {
    if (file.name.endsWith('.jsx') || file.name.endsWith('.tsx')) {
      const content = await readFileContent(file);
      try {
        const analysis = analyzeCodeStructure(content);
        components += analysis.components.length;
        hooks += analysis.hooks.length;
        
        Object.keys(nextFeatures).forEach(feature => {
          if (content.includes(feature)) {
            nextFeatures[feature]++;
          }
        });
      } catch (error) {
        console.error(`Error analyzing ${file.name}:`, error);
      }
    }
  }
  
  return {
    components,
    hooks,
    nextFeatures
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
