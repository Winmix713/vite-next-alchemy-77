
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ConversionProgress = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Converting Your Project</CardTitle>
        <CardDescription>Converting Next.js to Vite</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Processing files...</span>
              <span>67%</span>
            </div>
            <Progress value={67} className="h-2" />
          </div>
          
          <div className="bg-gray-50 p-3 rounded border text-sm font-mono text-gray-700 h-32 overflow-y-auto">
            <div className="text-green-600">✓ Analyzing project structure</div>
            <div className="text-green-600">✓ Creating vite.config.js</div>
            <div className="text-green-600">✓ Setting up React Router</div>
            <div className="text-green-600">✓ Converting pages to routes</div>
            <div className="text-green-600">✓ Transforming data fetching methods</div>
            <div className="text-blue-600">→ Replacing Next.js components...</div>
            <div className="text-gray-500">• Converting API routes</div>
            <div className="text-gray-500">• Updating package.json</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionProgress;
