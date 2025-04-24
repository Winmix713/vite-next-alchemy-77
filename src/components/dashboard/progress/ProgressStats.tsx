
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressStatsProps {
  progress: number;
  message: string;
}

export const ProgressStats = ({ progress, message }: ProgressStatsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>{message}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};
