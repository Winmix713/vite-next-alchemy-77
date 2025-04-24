
import { Badge } from "@/components/ui/badge";

interface ConversionResultProps {
  result: {
    appliedTransformations: string[];
    changes: string[];
    warnings: string[];
  };
}

const ConversionResult = ({ result }: ConversionResultProps) => {
  return (
    <div className="mt-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-green-800 mb-2">Konverzió eredménye</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• {result.appliedTransformations.length} átalakítás végrehajtva</li>
          <li>• {result.changes.length} komponens átalakítva</li>
          <li>• {result.warnings.length} figyelmeztetés</li>
        </ul>
        <p className="mt-2 text-sm text-green-700">
          A konvertált kód megtekinthető a "Konvertált kód" fül alatt.
        </p>
      </div>
    </div>
  );
};

export default ConversionResult;
