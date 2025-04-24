
interface ConversionStatsProps {
  stats: {
    totalFiles: number;
    convertedFiles: number;
    components: {
      image: number;
      link: number;
      head: number;
    };
    dataFetching: {
      getServerSideProps: number;
      getStaticProps: number;
      getStaticPaths: number;
    };
  };
}

export const ConversionStats = ({ stats }: ConversionStatsProps) => {
  return (
    <div className="bg-gray-50 p-3 rounded border h-64 overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-2 rounded shadow-sm">
          <div className="text-sm font-medium">Fájlok</div>
          <div className="mt-1 flex justify-between">
            <span className="text-xs text-gray-500">Összesen:</span>
            <span className="font-mono">{stats.totalFiles}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-xs text-gray-500">Konvertálva:</span>
            <span className="font-mono">{stats.convertedFiles}</span>
          </div>
        </div>
        
        <div className="bg-white p-2 rounded shadow-sm">
          <div className="text-sm font-medium">Komponensek</div>
          <div className="mt-1 flex justify-between">
            <span className="text-xs text-gray-500">Image:</span>
            <span className="font-mono">{stats.components.image}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-xs text-gray-500">Link:</span>
            <span className="font-mono">{stats.components.link}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
