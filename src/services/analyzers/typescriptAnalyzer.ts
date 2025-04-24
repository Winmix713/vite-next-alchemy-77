
export interface TypescriptAnalysis {
  nextTypesCount: number;
  customTypes: number;
}

export async function analyzeTypescript(files: File[]): Promise<TypescriptAnalysis> {
  let nextTypesCount = 0;
  let customTypes = 0;
  
  for (const file of files) {
    if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      const content = await readFileContent(file);
      
      const nextTypeMatches = content.match(/Next(?:Page|Api\w+|Config|Router|App\w+)/g);
      if (nextTypeMatches) {
        nextTypesCount += nextTypeMatches.length;
      }
      
      const typeMatches = content.match(/(?:type|interface)\s+\w+/g);
      if (typeMatches) {
        customTypes += typeMatches.length;
      }
    }
  }
  
  return {
    nextTypesCount,
    customTypes
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
