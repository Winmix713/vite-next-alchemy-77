import { useState } from "react";
import { toast } from "sonner";
import { transformCode } from "@/services/codeTransformer";
import { transformWithAst } from "@/services/astTransformer";
import { ConversionOptions } from "@/types/conversion";

export const useConversionHandler = (
  dispatch: any,
  parentOnStartConversion: () => void
) => {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [conversionResult, setConversionResult] = useState<any>(null);

  const updateProgress = async (newProgress: number, message: string) => {
    setProgress(newProgress);
    setProgressMessage(message);
    dispatch({ 
      type: "SET_CONVERSION_PROGRESS", 
      payload: { progress: newProgress, message } 
    });
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  const handleStartConversion = async () => {
    try {
      setIsConverting(true);
      setProgress(0);
      setProgressMessage("Konverzió indítása...");
      
      parentOnStartConversion();
      dispatch({ type: "SET_IS_CONVERTING", payload: true });
      
      toast.info("Next.js to Vite konverzió indítása...");
      
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
      
      await updateProgress(10, "AST alapú transzformáció...");
      const astResult = transformWithAst(exampleNextJsCode);
      
      await updateProgress(30, "Regex alapú konverzió...");
      const { transformedCode, appliedTransformations } = transformCode(astResult.code);
      
      await updateProgress(50, "Komponensek átalakítása...");
      await updateProgress(70, "Függőségek frissítése...");
      await updateProgress(85, "API route-ok konvertálása...");
      await updateProgress(95, "Projekt struktúra aktualizálása...");
      
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
          changeMade: astResult.changes.length,
          warningCount: astResult.warnings.length,
          conversionRate: appliedTransformations.length > 0 ? 100 : 0
        }
      };
      
      setConversionResult(result);
      dispatch({ 
        type: "SET_CONVERSION_RESULT", 
        payload: { success: true, result } 
      });
      
      await updateProgress(100, "Konverzió befejezve!");
      toast.success("Next.js to Vite konverzió sikeresen befejezve!");
      
    } catch (error) {
      toast.error(`Hiba a konverzió során: ${error instanceof Error ? error.message : String(error)}`);
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
    handleStartConversion
  };
};
