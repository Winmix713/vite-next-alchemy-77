
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { useConversion } from "@/context/ConversionContext";
import { ProgressStats } from "./progress/ProgressStats";
import { LogViewer } from "./progress/LogViewer";
import { ConversionStats } from "./progress/ConversionStats";

interface ConversionProgressProps {
  currentProgress?: number;
  currentMessage?: string;
}

const ConversionProgress = ({ 
  currentProgress = 0, 
  currentMessage = "Starting conversion..."
}: ConversionProgressProps) => {
  const { state } = useConversion();
  const [activeTab, setActiveTab] = useState("progress");
  const [logs, setLogs] = useState<{text: string, type: 'success' | 'info' | 'pending' | 'error'}[]>([
    { text: "Projekt struktúra elemzése", type: "pending" }
  ]);
  
  const [stats, setStats] = useState({
    totalFiles: 0,
    convertedFiles: 0,
    components: {
      image: 0,
      link: 0,
      head: 0
    },
    dataFetching: {
      getServerSideProps: 0,
      getStaticProps: 0,
      getStaticPaths: 0
    }
  });

  useEffect(() => {
    // Update logs based on progress
    if (currentProgress >= 50) {
      setLogs(prev => [...prev, { text: "Komponensek átalakítása", type: "pending" }]);
    }
  }, [currentProgress]);

  const handleDownload = () => {
    // In a real application, this would generate and download the converted project
    const dummyData = new Blob([JSON.stringify(state.convertedCode || "{}", null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dummyData);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    // In a real application, this would open a preview in a new tab
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Project Preview</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; }
            </style>
          </head>
          <body>
            <h1>Konvertált projekt előnézet</h1>
            <pre>${state.convertedCode || "No converted code available"}</pre>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Projekt konvertálása</CardTitle>
            <CardDescription>Next.js konvertálása Vite-ra</CardDescription>
          </div>
          <Badge variant={currentProgress < 100 ? "secondary" : "default"}>
            {currentProgress < 100 ? "Folyamatban..." : "Befejezve"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ProgressStats progress={currentProgress} message={currentMessage} />
          
          <Tabs defaultValue="progress" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="progress">Folyamat</TabsTrigger>
              <TabsTrigger value="stats">Statisztikák</TabsTrigger>
              <TabsTrigger value="details">Részletek</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="mt-0">
              <LogViewer logs={logs} />
            </TabsContent>
            
            <TabsContent value="stats" className="mt-0">
              <ConversionStats stats={stats} />
            </TabsContent>
          </Tabs>

          {currentProgress >= 95 && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>
                A konverzió befejeződött! Az átalakított projekt letölthető vagy előnézhető.
              </AlertDescription>
              <div className="flex gap-3 mt-3">
                <Button size="sm" variant="outline" onClick={handleDownload} className="flex items-center gap-1">
                  <Download size={16} /> Letöltés
                </Button>
                <Button size="sm" onClick={handlePreview} className="flex items-center gap-1">
                  <Eye size={16} /> Előnézet
                </Button>
              </div>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionProgress;
