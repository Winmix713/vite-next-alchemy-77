
import { ArrowDown, ArrowRight } from "lucide-react";
import CodePreview from "@/components/CodePreview";

interface CodeComparisonProps {
  beforeCode: string;
  afterCode: string;
  beforeTitle: string;
  afterTitle: string;
}

const CodeComparison = ({ beforeCode, afterCode, beforeTitle, afterTitle }: CodeComparisonProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CodePreview title={beforeTitle} code={beforeCode} />
      <div className="hidden lg:flex items-center justify-center">
        <div className="p-3 rounded-full bg-blue-100">
          <ArrowRight className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <div className="flex lg:hidden items-center justify-center">
        <div className="p-3 rounded-full bg-blue-100">
          <ArrowDown className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <CodePreview title={afterTitle} code={afterCode} />
    </div>
  );
};

export default CodeComparison;
