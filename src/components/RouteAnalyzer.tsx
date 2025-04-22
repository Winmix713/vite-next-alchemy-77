
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { analyzeNextJsRoutes, NextJsRoute } from "@/services/routeConverter";

interface RouteAnalyzerProps {
  files: File[];
  onRoutesAnalyzed: (routes: NextJsRoute[]) => void;
}

const RouteAnalyzer = ({ files, onRoutesAnalyzed }: RouteAnalyzerProps) => {
  const [analyzedRoutes, setAnalyzedRoutes] = useState<NextJsRoute[]>([]);

  useEffect(() => {
    if (files.length > 0) {
      const routes = analyzeNextJsRoutes(files);
      setAnalyzedRoutes(routes);
      onRoutesAnalyzed(routes);
    }
  }, [files, onRoutesAnalyzed]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Analysis</CardTitle>
        <CardDescription>Detected Next.js routes in your project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analyzedRoutes.map((route, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg border">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteAnalyzer;
