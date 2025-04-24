
import { ConversionOptions, ConversionState } from '@/types/conversion';
import { transformWithAst } from './astTransformer';
import { TransformResult, FileTransformResult } from '@/types/transformerTypes';
import { ConversionMetrics, ConversionReport } from '@/types/analyzer';

interface ConversionResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  stats: ConversionStats;
}

interface ConversionStats {
  totalFiles: number;
  modifiedFiles: number;
  transformationRate: number;
  dependencyChanges: number;
  routeChanges: number;
}

export class ConversionExecutor {
  private options: ConversionOptions;
  private files: File[];
  private packageJson?: any;
  private progress: number = 0;
  private progressCallback?: (progress: number, message: string) => void;
  private result: ConversionResult;
  private fileResults: Map<string, FileTransformResult> = new Map();
  private startTime: number = 0;
  private endTime: number = 0;

  constructor(files: File[], packageJson: any = null, options: ConversionOptions) {
    this.files = files;
    this.packageJson = packageJson;
    this.options = options;
    this.result = this.initializeResult();
  }

  private initializeResult(): ConversionResult {
    return {
      success: false,
      errors: [],
      warnings: [],
      info: [],
      stats: {
        totalFiles: this.files.length,
        modifiedFiles: 0,
        transformationRate: 0,
        dependencyChanges: 0,
        routeChanges: 0
      }
    };
  }

  setProgressCallback(callback: (progress: number, message: string) => void): this {
    this.progressCallback = callback;
    return this;
  }

  private async updateProgress(increment: number, message: string): Promise<void> {
    this.progress = Math.min(this.progress + increment, 100);
    this.progressCallback?.(this.progress, message);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async execute(): Promise<ConversionResult> {
    try {
      this.startTime = Date.now();
      await this.updateProgress(5, "Starting conversion...");
      
      // Analyze project structure
      await this.updateProgress(10, "Analyzing project structure...");
      
      // Transform files
      await this.transformFiles();
      
      // Update dependencies
      if (this.options.updateDependencies) {
        await this.updateProgress(80, "Updating dependencies...");
        await this.updateDependencies();
      }
      
      // Generate final project
      await this.updateProgress(90, "Generating final project...");
      await this.generateFinalProject();
      
      // Complete conversion
      this.endTime = Date.now();
      await this.updateProgress(100, "Conversion completed!");
      
      this.result.success = this.result.errors.length === 0;
      return this.result;
    } catch (error) {
      this.endTime = Date.now();
      this.result.success = false;
      this.result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      return this.result;
    }
  }

  private async transformFiles(): Promise<void> {
    const progressStep = 60 / this.files.length;
    let processedFiles = 0;

    for (const file of this.files) {
      try {
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        
        // Skip non-code files
        if (!['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'json', 'html'].includes(fileExtension || '')) {
          await this.updateProgress(progressStep, `Skipping ${fileName} (non-code file)`);
          continue;
        }
        
        // Read file content
        const content = await this.readFileContent(file);
        
        // Process based on file type
        let result: TransformResult;
        
        if (fileName.includes('package.json')) {
          await this.updateProgress(progressStep, `Processing dependencies in ${fileName}...`);
          // Process package.json separately
          result = { transformedCode: content, appliedTransformations: [] };
        }
        else if (fileExtension === 'json') {
          // Skip transformation for JSON files
          result = { transformedCode: content, appliedTransformations: [] };
        }
        else if (['css', 'scss'].includes(fileExtension || '')) {
          // Process CSS files
          await this.updateProgress(progressStep, `Processing styles in ${fileName}...`);
          result = { transformedCode: content, appliedTransformations: [] };
        }
        else if (fileName.includes('/pages/') || fileName.includes('\\pages\\')) {
          // Process Next.js pages
          await this.updateProgress(progressStep, `Converting page component: ${fileName}...`);
          result = transformWithAst(content);
        }
        else if (fileName.includes('/api/') || fileName.includes('\\api\\')) {
          // Process API routes
          if (this.options.convertApiRoutes) {
            await this.updateProgress(progressStep, `Converting API route: ${fileName}...`);
            result = transformWithAst(content);
          } else {
            result = { transformedCode: content, appliedTransformations: [] };
          }
        }
        else if (fileName.includes('_app') || fileName.includes('_document')) {
          // Process Next.js special files
          await this.updateProgress(progressStep, `Converting special Next.js file: ${fileName}...`);
          result = transformWithAst(content);
        }
        else {
          // Process other code files
          await this.updateProgress(progressStep, `Processing ${fileName}...`);
          result = transformWithAst(content);
        }
        
        // Store result
        if (result.appliedTransformations.length > 0) {
          this.result.stats.modifiedFiles++;
          this.result.info.push(`Transformed ${fileName}:\n${result.appliedTransformations.join('\n')}`);
        }
        
        // Store detailed file result
        const fileResult: FileTransformResult = {
          filePath: fileName,
          original: content,
          transformedCode: result.transformedCode,
          appliedTransformations: result.appliedTransformations,
          success: true,
          performance: {
            startTime: Date.now() - 1000, // Mock start time
            endTime: Date.now(),
            duration: 1000 // Mock duration
          }
        };
        
        this.fileResults.set(fileName, fileResult);
        
        processedFiles++;
      } catch (error) {
        this.result.errors.push(`Error processing ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    this.result.stats.transformationRate = this.result.stats.modifiedFiles / this.files.length;
  }

  private async updateDependencies(): Promise<void> {
    if (!this.packageJson) {
      return;
    }

    const nextDependencies = [
      'next',
      'next-themes',
      'next-seo',
      'next-i18next',
      'next-auth',
      'next-pwa'
    ];
    
    const replacementDependencies: Record<string, string> = {
      'next': 'vite',
      'next-themes': '@vite-pwa/assets-generator',
      'next-auth': 'auth-kit',
      'next-i18next': 'i18next',
      'next-pwa': 'vite-plugin-pwa'
    };
    
    const newDependencies = [
      '@vitejs/plugin-react',
      'vite-tsconfig-paths',
      'vite-plugin-svgr',
      '@tanstack/react-router'
    ];
    
    let dependencyChanges = 0;
    
    // Update existing dependencies
    if (this.packageJson.dependencies) {
      for (const dep of nextDependencies) {
        if (this.packageJson.dependencies[dep]) {
          delete this.packageJson.dependencies[dep];
          const replacement = replacementDependencies[dep];
          if (replacement) {
            this.packageJson.dependencies[replacement] = 'latest';
          }
          dependencyChanges++;
        }
      }
    }
    
    // Add new dependencies
    if (!this.packageJson.dependencies) {
      this.packageJson.dependencies = {};
    }
    
    for (const dep of newDependencies) {
      if (!this.packageJson.dependencies[dep]) {
        this.packageJson.dependencies[dep] = 'latest';
        dependencyChanges++;
      }
    }
    
    this.result.stats.dependencyChanges = dependencyChanges;
    this.result.info.push(`Updated ${dependencyChanges} dependencies`);
  }

  private async generateFinalProject(): Promise<void> {
    // In a real implementation, this would assemble the final project structure
    // For demo purposes, we'll just count some stats
    
    // Count route changes
    let routeChanges = 0;
    for (const [filePath, result] of this.fileResults) {
      if (filePath.includes('/pages/') || filePath.includes('\\pages\\')) {
        routeChanges++;
      }
    }
    
    this.result.stats.routeChanges = routeChanges;
    this.result.info.push(`Converted ${routeChanges} routes`);
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsText(file);
    });
  }

  public getConversionMetrics(): ConversionMetrics {
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime - this.startTime,
      filesProcessed: this.files.length,
      filesConverted: this.result.stats.modifiedFiles,
      successRate: this.result.stats.transformationRate * 100,
      errorCount: this.result.errors.length,
      warningCount: this.result.warnings.length
    };
  }

  public getConversionReport(): ConversionReport {
    return {
      metrics: this.getConversionMetrics(),
      summary: `Converted ${this.result.stats.modifiedFiles} out of ${this.files.length} files (${Math.round(this.result.stats.transformationRate * 100)}%)`,
      details: {
        components: [], // Would be populated with component analysis
        routing: {
          routes: [],
          dynamicRoutes: 0,
          complexRoutes: 0
        },
        dependencies: {
          dependencies: [],
          compatibility: {
            compatible: true,
            issues: []
          }
        },
        errors: this.result.errors,
        warnings: this.result.warnings
      }
    };
  }
}
