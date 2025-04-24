
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PreviewTabContent from "./code-preview/PreviewTabContent";
import {
  EXAMPLE_NEXTJS_HOME,
  EXAMPLE_VITE_HOME,
  EXAMPLE_NEXTJS_API,
  EXAMPLE_EXPRESS_API,
  EXAMPLE_NEXTJS_CONFIG,
  EXAMPLE_VITE_CONFIG
} from "./code-preview/example-code";

const CodePreviewTabs = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Preview</CardTitle>
        <CardDescription>See how your code will be converted</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="home-page">
          <TabsList className="mb-4">
            <TabsTrigger value="home-page">Home Page</TabsTrigger>
            <TabsTrigger value="api-route">API Route</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
          
          <PreviewTabContent
            value="home-page"
            beforeTitle="Next.js"
            afterTitle="Vite + React Router"
            beforeCode={EXAMPLE_NEXTJS_HOME}
            afterCode={EXAMPLE_VITE_HOME}
          />
          
          <PreviewTabContent
            value="api-route"
            beforeTitle="Next.js API Route"
            afterTitle="Express API Route"
            beforeCode={EXAMPLE_NEXTJS_API}
            afterCode={EXAMPLE_EXPRESS_API}
          />
          
          <PreviewTabContent
            value="config"
            beforeTitle="Next.js Config"
            afterTitle="Vite Config"
            beforeCode={EXAMPLE_NEXTJS_CONFIG}
            afterCode={EXAMPLE_VITE_CONFIG}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodePreviewTabs;
