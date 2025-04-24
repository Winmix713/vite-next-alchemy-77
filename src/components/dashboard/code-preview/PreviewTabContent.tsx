
import { TabsContent } from "@/components/ui/tabs";
import CodeComparison from "./CodeComparison";

interface PreviewTabContentProps {
  value: string;
  beforeTitle: string;
  afterTitle: string;
  beforeCode: string;
  afterCode: string;
}

const PreviewTabContent = ({ 
  value, 
  beforeTitle, 
  afterTitle, 
  beforeCode, 
  afterCode 
}: PreviewTabContentProps) => {
  return (
    <TabsContent value={value}>
      <CodeComparison
        beforeTitle={beforeTitle}
        afterTitle={afterTitle}
        beforeCode={beforeCode}
        afterCode={afterCode}
      />
    </TabsContent>
  );
};

export default PreviewTabContent;
