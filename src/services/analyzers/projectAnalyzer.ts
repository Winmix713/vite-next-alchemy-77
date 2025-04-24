
import { CodebaseAnalysis, ValidationResult } from '@/types/analyzer';

/**
 * Analyze a complete Next.js project
 */
export async function analyzeProject(files: File[]): Promise<{
  analysis: CodebaseAnalysis;
  validation: ValidationResult;
}> {
  // Initialize the analysis object
  const analysis: CodebaseAnalysis = {
    totalFiles: files.length,
    jsFiles: 0,
    tsFiles: 0,
    reactComponents: 0,
    hooks: 0,
    cssFiles: 0,
    apiRoutes: 0,
    nextjsFeatureUsage: {
      'next/image': 0,
      'next/link': 0,
      'next/head': 0,
      'next/router': 0,
      'getServerSideProps': 0,
      'getStaticProps': 0,
      'getStaticPaths': 0,
      'NextApiRequest': 0,
      'NextApiResponse': 0,
      'middleware': 0
    }
  };

  // Initialize validation result
  const validation: ValidationResult = {
    valid: true,
    issues: [],
    components: []
  };

  // Analyze each file
  for (const file of files) {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    
    // Count file types
    if (fileExtension === 'js' || fileExtension === 'jsx') {
      analysis.jsFiles++;
    } else if (fileExtension === 'ts' || fileExtension === 'tsx') {
      analysis.tsFiles++;
    } else if (['css', 'scss', 'sass', 'less'].includes(fileExtension || '')) {
      analysis.cssFiles++;
    }
    
    // Check for API routes
    if (fileName.includes('/api/') || fileName.includes('\\api\\')) {
      analysis.apiRoutes++;
    }
    
    try {
      // Read file content
      const content = await readFileContent(file);
      
      // Check for Next.js features
      for (const feature of Object.keys(analysis.nextjsFeatureUsage)) {
        if (content.includes(feature)) {
          analysis.nextjsFeatureUsage[feature]++;
        }
      }
      
      // Count React components and hooks
      if (
        (fileExtension === 'jsx' || fileExtension === 'tsx') &&
        (content.includes('export default') || content.includes('React.'))
      ) {
        analysis.reactComponents++;
        
        // Basic detection for hooks
        if (content.includes('useState') || 
            content.includes('useEffect') || 
            content.includes('useContext')) {
          analysis.hooks++;
        }
      }
      
      // Validate file
      validateFile(fileName, content, validation);
      
    } catch (error) {
      console.error(`Error analyzing file ${fileName}:`, error);
      validation.issues.push(`Failed to analyze ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Overall validation check
  if (validation.issues.length > 0) {
    validation.valid = false;
  }
  
  return { analysis, validation };
}

/**
 * Validate an individual file
 */
function validateFile(fileName: string, content: string, validation: ValidationResult) {
  // Check for potential issues
  
  // Check for missing imports
  if (
    content.includes('Link') && !content.includes("import Link") ||
    content.includes('Image') && !content.includes("import Image") ||
    content.includes('Head') && !content.includes("import Head")
  ) {
    validation.issues.push(`${fileName}: Possible missing import for Next.js component`);
  }
  
  // Check for incorrect data fetching patterns
  if (content.includes('getServerSideProps') && content.includes('getStaticProps')) {
    validation.issues.push(`${fileName}: File contains both getServerSideProps and getStaticProps`);
  }
  
  // Add component to validation
  const componentMatch = fileName.match(/\/([^\/]+)\.(jsx|tsx)$/);
  if (componentMatch) {
    const componentName = componentMatch[1];
    
    // Determine component status
    let status: 'ok' | 'warning' | 'error' = 'ok';
    let message;
    
    if (content.includes('getServerSideProps') || content.includes('getStaticProps')) {
      status = 'warning';
      message = 'Contains data fetching methods that need transformation';
    }
    
    if (content.includes('next/router') && content.includes('useRouter')) {
      status = 'warning';
      message = (message || '') + ' Uses Next.js router that needs to be replaced with React Router';
    }
    
    validation.components.push({
      name: componentName,
      status,
      message
    });
  }
}

/**
 * Read file content as text
 */
function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      reject(new Error('Error reading file'));
    };
    reader.readAsText(file);
  });
}
