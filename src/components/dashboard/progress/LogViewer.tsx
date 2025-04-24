
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface Log {
  text: string;
  type: 'success' | 'info' | 'pending' | 'error';
}

interface LogViewerProps {
  logs: Log[];
}

export const LogViewer = ({ logs }: LogViewerProps) => {
  return (
    <div className="bg-gray-50 p-3 rounded border text-sm font-mono text-gray-700 h-64 overflow-y-auto">
      {logs.map((log, index) => (
        <div
          key={index}
          className={`
            ${log.type === 'success' ? "text-green-600" : 
              log.type === 'pending' ? "text-blue-600" : 
              log.type === 'error' ? "text-red-600" : 
              "text-gray-500"}
            mb-1 flex items-center
          `}
        >
          {log.type === 'success' && <CheckCircle size={14} className="mr-1" />}
          {log.type === 'pending' && <Clock size={14} className="mr-1" />}
          {log.type === 'error' && <AlertCircle size={14} className="mr-1" />}
          {log.text}
        </div>
      ))}
    </div>
  );
};
