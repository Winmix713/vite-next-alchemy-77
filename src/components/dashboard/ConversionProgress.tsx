
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConversion } from "@/context/ConversionContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConversionProgressProps {
  currentProgress?: number;
  currentMessage?: string;
}

const ConversionProgress = ({ 
  currentProgress = 67, 
  currentMessage = "Fájlok feldolgozása..."
}: ConversionProgressProps) => {
  const { state } = useConversion();
  const [progress, setProgress] = useState(currentProgress);
  const [message, setMessage] = useState(currentMessage);
  const [logs, setLogs] = useState<{text: string, type: 'success' | 'info' | 'pending' | 'error'}[]>([
    { text: "Projekt struktúra elemzése", type: "success" },
    { text: "vite.config.js létrehozása", type: "success" },
    { text: "React Router beállítása", type: "success" },
    { text: "Oldalak konvertálása route-okra", type: "success" },
    { text: "Adatlekérési metódusok átalakítása", type: "success" },
    { text: "Next.js komponensek cseréje...", type: "pending" },
    { text: "API route-ok konvertálása", type: "info" },
    { text: "package.json frissítése", type: "info" },
  ]);

  useEffect(() => {
    // Szimuláljuk a valós idejű konverziós folyamatot
    const interval = setInterval(() => {
      setProgress(oldProgress => {
        // Legfeljebb 95%-ig megy, hogy lássuk, hogy még fut
        if (oldProgress >= 95) {
          clearInterval(interval);
          return 95;
        }
        return oldProgress + 1;
      });

      // Frissítsük az állapotokat a szimuláció során 
      if (progress > 75 && logs[5].type === "pending") {
        setLogs(oldLogs => {
          const newLogs = [...oldLogs];
          newLogs[5].type = "success";
          newLogs[6].type = "pending";
          return newLogs;
        });
        setMessage("API route-ok konvertálása...");
      } else if (progress > 85 && logs[6].type === "pending") {
        setLogs(oldLogs => {
          const newLogs = [...oldLogs];
          newLogs[6].type = "success";
          newLogs[7].type = "pending";
          return newLogs;
        });
        setMessage("package.json frissítése...");
      } else if (progress >= 95 && logs[7].type === "pending") {
        setLogs(oldLogs => {
          const newLogs = [...oldLogs];
          newLogs[7].type = "success";
          return newLogs;
        });
        setMessage("Konverzió befejezve!");
      }
    }, 200);

    return () => clearInterval(interval);
  }, [progress, logs]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Projekt konvertálása</CardTitle>
            <CardDescription>Next.js konvertálása Vite-ra</CardDescription>
          </div>
          <Badge variant={progress < 100 ? "secondary" : "default"}>
            {progress < 100 ? "Folyamatban..." : "Befejezve"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{message}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="bg-gray-50 p-3 rounded border text-sm font-mono text-gray-700 h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className={`
                ${log.type === 'success' ? "text-green-600" : 
                  log.type === 'pending' ? "text-blue-600" : 
                  log.type === 'error' ? "text-red-600" : 
                  "text-gray-500"}
                mb-1
              `}>
                {log.type === 'success' && "✓ "}
                {log.type === 'pending' && "→ "}
                {log.type === 'error' && "✗ "}
                {log.type === 'info' && "• "}
                {log.text}
              </div>
            ))}
          </div>

          {progress >= 95 && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>
                A konverzió befejeződött! Az átalakított projekt letölthető vagy előnézhető.
              </AlertDescription>
            </Alert>
          )}
          
          {state.conversionOptions.useReactRouter && progress >= 40 && (
            <div className="mt-2">
              <h3 className="text-sm font-medium mb-2">React Router konvertálása</h3>
              <div className="text-xs bg-gray-50 p-2 rounded border">
                <div><span className="font-semibold">Next.js:</span> pages/blog/[id].tsx</div>
                <div><span className="font-semibold">Vite:</span> src/routes/blog/:id</div>
              </div>
            </div>
          )}
          
          {state.conversionOptions.transformDataFetching && progress >= 60 && (
            <div className="mt-2">
              <h3 className="text-sm font-medium mb-2">Adatlekérési átalakítások</h3>
              <div className="text-xs bg-gray-50 p-2 rounded border">
                <div><span className="font-semibold">Next.js:</span> getServerSideProps, getStaticProps</div>
                <div><span className="font-semibold">Vite:</span> React Query vagy SWR</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionProgress;
