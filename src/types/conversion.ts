
export interface ConversionOptions {
  useReactRouter: boolean;
  convertApiRoutes: boolean;
  transformDataFetching: boolean;
  replaceComponents: boolean;
  updateDependencies: boolean;
  preserveTypeScript: boolean;
  handleMiddleware?: boolean;
}

export interface RouteConversionResult {
  originalPath: string;
  convertedPath: string;
  component: string;
  imports: string[];
  code: string;
}
