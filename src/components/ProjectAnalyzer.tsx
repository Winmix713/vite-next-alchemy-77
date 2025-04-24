
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeProject } from "@/services/analyzers/projectAnalyzer";
import { CodebaseAnalysis, ValidationResult } from "@/types/analyzer";

interface ProjectAnalyzerProps {
  files: File[];
  onAnalysisComplete: (results: any) => void;
}

const ProjectAnalyzer = ({ files, onAnalysisComplete }: ProjectAnalyzerProps) => {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [analysis, setAnalysis] = useState<CodebaseAnalysis | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!files.length) return;
    
    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setProgress(0);
      
      // Update progress for each file
      const totalFiles = files.length;
      let processedFiles = 0;
      
      try {
        // Process each file
        for (const file of files) {
          setCurrentFile(file.name);
          await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for UI feedback
          processedFiles++;
          setProgress(Math.floor((processedFiles / totalFiles) * 80)); // Use 80% for file analysis
        }
        
        // Run the actual analysis
        setCurrentFile("Running detailed analysis...");
        const result = await analyzeProject(files);
        
        setAnalysis(result.analysis);
        setValidation(result.validation);
        setProgress(100);
        
        // Calculate complexity score
        const complexityScore = calculateComplexityScore(result.analysis);
        
        // Pass results to parent
        onAnalysisComplete({
          ...result.analysis,
          complexityScore,
          validation: result.validation
        });
      } catch (error) {
        console.error("Error analyzing project:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    runAnalysis();
  }, [files, onAnalysisComplete]);

  // Calculate a complexity score based on the analysis
  const calculateComplexityScore = (analysis: CodebaseAnalysis): number => {
    let score = 0;
    
    // Base score from file counts
    score += analysis.totalFiles * 0.5;
    score += analysis.apiRoutes * 2;
    
    // Additional points for Next.js features
    Object.entries(analysis.nextjsFeatureUsage).forEach(([feature, count]) => {
      if (feature === 'getServerSideProps' || feature === 'getStaticProps') {
        score += count * 3; // Data fetching is complex to convert
      } else if (feature === 'middleware') {
        score += count * 4; // Middleware is very complex to convert
      } else {
        score += count * 1.5; // Other Next.js features
      }
    });
    
    // Cap at 100
    return Math.min(100, Math.floor(score));
  };

  const getComplexityLabel = (score: number): string => {
    if (score < 30) return "Easy";
    if (score < 60) return "Moderate";
    return "Complex";
  };

  const getComplexityColor = (score: number): string => {
    if (score < 30) return "bg-green-400";
    if (score < 60) return "bg-yellow-400";
    return "bg-red-400";
  };

  const getComplexityVariant = (score: number): "outline" | "secondary" | "destructive" => {
    if (score < 30) return "outline";
    if (score < 60) return "secondary";
    return "destructive";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analyzing Project</CardTitle>
        <CardDescription>Scanning files and determining conversion complexity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{currentFile}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {analysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-gray-500">Total Files</div>
                <div className="text-2xl font-semibold">{analysis.totalFiles}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-gray-500">Next.js Components</div>
                <div className="text-2xl font-semibold">{analysis.reactComponents}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-gray-500">API Routes</div>
                <div className="text-2xl font-semibold">{analysis.apiRoutes}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-gray-500">Next.js Features</div>
                <div className="text-2xl font-semibold">
                  {Object.values(analysis.nextjsFeatureUsage).reduce((sum, count) => sum + count, 0)}
                </div>
              </div>
            </div>
          )}
          
          {validation && validation.issues.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Issues Detected</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  {validation.issues.slice(0, 3).map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                  {validation.issues.length > 3 && (
                    <li>...and {validation.issues.length - 3} more issues</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {analysis && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Next.js Feature Usage</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(analysis.nextjsFeatureUsage)
                  .filter(([_, count]) => count > 0)
                  .map(([feature, count]) => (
                    <div key={feature} className="flex justify-between items-center text-sm border rounded px-3 py-1">
                      <span>{feature}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {analysis && (
        <CardFooter>
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Complexity Score</span>
              <div>
                <Badge variant={getComplexityVariant(calculateComplexityScore(analysis))}>
                  {getComplexityLabel(calculateComplexityScore(analysis))}
                </Badge>
              </div>
            </div>
            <Progress 
              value={calculateComplexityScore(analysis)} 
              className={`h-2 ${getComplexityColor(calculateComplexityScore(analysis))}`}
            />
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProjectAnalyzer;
