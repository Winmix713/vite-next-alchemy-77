export interface ConversionOptions {
  useReactRouter: boolean;
  convertApiRoutes: boolean;
  transformDataFetching: boolean;
  replaceComponents: boolean;
  updateDependencies: boolean;
  preserveTypeScript: boolean;
  handleMiddleware: boolean;
}

export interface ConversionState {
  isConverting: boolean;
  conversionOptions: ConversionOptions;
  progress: number;
  message: string;
  projectData?: {
    files: File[];
    packageJson?: any;
  };
  originalCode?: string;
  convertedCode?: string;
  conversionResult?: any;
  conversionError?: string;
}

export interface ConversionContextType {
  state: ConversionState;
  dispatch: (action: any) => void;
}
