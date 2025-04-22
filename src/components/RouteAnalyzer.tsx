
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { analyzeNextJsRoutes, convertToReactRoutes, NextJsRoute } from "@/services/routeConverter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronRight } from "lucide-react";

interface RouteAnalyzerProps {
  files: File[];
  onRoutesAnalyzed: (routes: NextJsRoute[]) => void;
}

const RouteAnalyzer = ({ files, onRoutesAnalyzed }: RouteAnalyzerProps) => {
  const [analyzedRoutes, setAnalyzedRoutes] = useState<NextJsRoute[]>([]);
  const [convertedRoutes, setConvertedRoutes] = useState<any[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      const routes = analyzeNextJsRoutes(files);
      const reactRoutes = convertToReactRoutes(routes);
      setAnalyzedRoutes(routes);
      setConvertedRoutes(reactRoutes);
      onRoutesAnalyzed(routes);
    }
  }, [files, onRoutesAnalyzed]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Analysis</CardTitle>
        <CardDescription>Next.js routes detected and their React Router equivalents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analyzedRoutes.map((route, index) => (
            <div key={index} className="space-y-2">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{route.path}</span>
                  {route.isDynamic && (
                    <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Dynamic Route
                    </span>
                  )}
                </div>
                {route.hasParams && (
                  <div className="mt-2 text-sm text-gray-500">
                    Parameters: {route.params?.join(', ')}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center">
                <ChevronRight className="text-gray-400" />
              </div>

              <Alert>
                <AlertDescription className="font-mono text-sm">
                  {convertedRoutes[index]?.path || 'Converting...'}
                </AlertDescription>
              </Alert>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteAnalyzer;
