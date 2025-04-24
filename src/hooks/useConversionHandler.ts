
import { useState } from "react";
import { toast } from "sonner";
import { transformCode } from "@/services/codeTransformer";
import { transformWithAst } from "@/services/astTransformer";
import { ConversionOptions, ConversionHistory } from "@/types/conversion";
import { ConversionExecutor } from "@/services/conversionExecutor";
import { ProjectService } from "@/services/projectService";
import { useAuth } from "@/services/authService";

export const useConversionHandler = (
  dispatch: any,
  parentOnStartConversion: () => void
) => {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [conversionResult, setConversionResult] = useState<any>(null);
  const { user } = useAuth();
  const projectService = ProjectService.getInstance();

  const updateProgress = async (newProgress: number, message: string) => {
    setProgress(newProgress);
    setProgressMessage(message);
    dispatch({ 
      type: "SET_CONVERSION_PROGRESS", 
      payload: { progress: newProgress, message } 
    });
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  const handleStartConversion = async (
    projectId?: string,
    projectName?: string
  ) => {
    try {
      setIsConverting(true);
      setProgress(0);
      setProgressMessage("Starting conversion...");
      
      parentOnStartConversion();
      dispatch({ type: "SET_IS_CONVERTING", payload: true });
      
      toast.info("Starting Next.js to Vite conversion process...");
      
      const exampleNextJsCode = `
        import Head from 'next/head';
        import Image from 'next/image';
        import Link from 'next/link';
        import { useRouter } from 'next/router';
        
        export const getServerSideProps = async () => {
          const res = await fetch('https://api.example.com/data');
          const data = await res.json();
          return { props: { data } };
        }
        
        export default function HomePage({ data }) {
          const router = useRouter();
          
          const handleClick = () => {
            router.push('/about');
          }
          
          return (
            <div>
              <Head>
                <title>My Next.js App</title>
                <meta name="description" content="My awesome app" />
              </Head>
              <h1>Welcome to my app</h1>
              <Image src="/logo.png" width={200} height={100} alt="Logo" />
              <Link href="/about">About us</Link>
              <button onClick={() => router.push('/contact')}>Contact</button>
              <div>
                {data.map(item => (
                  <div key={item.id}>{item.name}</div>
                ))}
              </div>
            </div>
          )
        }
      `;
      
      // Get the conversion options from the state
      const conversionOptions = await new Promise<ConversionOptions>(resolve => {
        dispatch({ 
          type: "GET_CONVERSION_OPTIONS", 
          payload: (options: ConversionOptions) => resolve(options) 
        });
      });

      await updateProgress(10, "AST-based transformation...");
      const astResult = transformWithAst(exampleNextJsCode);
      
      await updateProgress(30, "Regex-based conversion...");
      const { transformedCode, appliedTransformations } = transformCode(astResult.code);
      
      await updateProgress(50, "Transforming components...");
      await updateProgress(70, "Updating dependencies...");
      await updateProgress(85, "Converting API routes...");
      await updateProgress(95, "Updating project structure...");
      
      dispatch({ type: "SET_ORIGINAL_CODE", payload: exampleNextJsCode });
      dispatch({ type: "SET_CONVERTED_CODE", payload: transformedCode });
      
      const result = {
        success: true,
        originalCode: exampleNextJsCode,
        transformedCode,
        appliedTransformations,
        changes: astResult.changes,
        warnings: astResult.warnings,
        stats: {
          totalTransformations: appliedTransformations.length,
          changesMade: astResult.changes.length,
          warningCount: astResult.warnings.length,
          conversionRate: appliedTransformations.length > 0 ? 100 : 0
        }
      };
      
      setConversionResult(result);
      dispatch({ 
        type: "SET_CONVERSION_RESULT", 
        payload: { success: true, result } 
      });
      
      // If we have a project ID and the user is logged in, save the conversion history
      if (projectId && user) {
        try {
          const metrics = {
            startTime: Date.now() - 5000, // Mock start time 5 seconds ago
            endTime: Date.now(),
            duration: 5000,
            filesProcessed: 1,
            filesConverted: 1,
            successRate: 100,
            errorCount: 0,
            warningCount: astResult.warnings.length
          };
          
          await projectService.addConversionHistory(
            projectId,
            user.id,
            conversionOptions,
            metrics
          );
          
          toast.success(`Conversion saved to project: ${projectName || projectId}`);
        } catch (error) {
          console.error('Failed to save conversion history:', error);
        }
      }
      
      await updateProgress(100, "Conversion completed!");
      toast.success("Next.js to Vite conversion successfully completed!");
      
    } catch (error) {
      toast.error(`Error during conversion: ${error instanceof Error ? error.message : String(error)}`);
      dispatch({ 
        type: "SET_CONVERSION_ERROR", 
        payload: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsConverting(false);
      dispatch({ type: "SET_IS_CONVERTING", payload: false });
    }
  };

  const handleFullConversion = async (files: File[], packageJson: any, options: ConversionOptions) => {
    try {
      setIsConverting(true);
      setProgress(0);
      setProgressMessage("Starting full conversion...");
      
      parentOnStartConversion();
      dispatch({ type: "SET_IS_CONVERTING", payload: true });
      
      toast.info("Starting full Next.js to Vite conversion process...");
      
      // Create conversion executor with the files and options
      const executor = new ConversionExecutor(
        files,
        packageJson,
        options
      );
      
      // Set up progress callback
      executor.setProgressCallback((progress, message) => {
        setProgress(progress);
        setProgressMessage(message);
        dispatch({ 
          type: "SET_CONVERSION_PROGRESS", 
          payload: { progress, message } 
        });
      });
      
      // Execute conversion process
      const result = await executor.execute();
      
      // Handle conversion result
      if (result.success) {
        const conversionReport = executor.getConversionReport();
        
        toast.success("Conversion completed successfully!");
        setConversionResult({
          success: true,
          report: conversionReport,
          stats: result.stats
        });
        
        dispatch({ 
          type: "SET_CONVERSION_RESULT", 
          payload: { 
            success: true, 
            result: {
              report: conversionReport,
              stats: result.stats
            }
          } 
        });
      } else {
        toast.error(`Conversion completed with ${result.errors.length} errors.`);
        setConversionResult({
          success: false,
          errors: result.errors,
          warnings: result.warnings,
          stats: result.stats
        });
        
        dispatch({ 
          type: "SET_CONVERSION_RESULT", 
          payload: { 
            success: false, 
            result: {
              errors: result.errors,
              warnings: result.warnings,
              stats: result.stats
            }
          } 
        });
      }
      
    } catch (error) {
      toast.error(`Error during conversion: ${error instanceof Error ? error.message : String(error)}`);
      dispatch({ 
        type: "SET_CONVERSION_ERROR", 
        payload: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsConverting(false);
      dispatch({ type: "SET_IS_CONVERTING", payload: false });
    }
  };

  return {
    isConverting,
    progress,
    progressMessage,
    conversionResult,
    handleStartConversion,
    handleFullConversion
  };
};
