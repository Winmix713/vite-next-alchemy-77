
import { useEffect } from "react";
import ProjectStats from "./ProjectStats";
import ConversionOptions from "./ConversionOptions";
import CodePreviewTabs from "./CodePreviewTabs";
import ConversionProgress from "./ConversionProgress";
import ConversionResult from "./results/ConversionResult";
import { useConversion } from "@/context/ConversionContext";
import { useConversionHandler } from "@/hooks/useConversionHandler";

interface ConversionDashboardProps {
  projectData: any;
  onStartConversion: () => void;
  isConverting: boolean;
}

const ConversionDashboard = ({ 
  projectData, 
  onStartConversion: parentOnStartConversion,
  isConverting: parentIsConverting 
}: ConversionDashboardProps) => {
  const { state, dispatch, toggleOption } = useConversion();
  const {
    isConverting,
    progress,
    progressMessage,
    conversionResult,
    handleStartConversion
  } = useConversionHandler(dispatch, parentOnStartConversion);

  // Use parent state if provided, otherwise use local state
  const conversionInProgress = parentIsConverting || isConverting;

  // When component mounts, update the context with the project data
  useEffect(() => {
    if (projectData) {
      dispatch({ type: "SET_PROJECT_DATA", payload: projectData });
    }
  }, [projectData, dispatch]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <ProjectStats projectData={projectData} />
        <ConversionOptions 
          options={state.conversionOptions}
          onOptionToggle={toggleOption}
          onStartConversion={handleStartConversion}
          isConverting={conversionInProgress}
        />
      </div>

      <CodePreviewTabs />

      {conversionInProgress && (
        <ConversionProgress 
          currentProgress={progress} 
          currentMessage={progressMessage}
        />
      )}
      
      {conversionResult && !conversionInProgress && (
        <ConversionResult result={conversionResult} />
      )}
    </div>
  );
};

export default ConversionDashboard;
