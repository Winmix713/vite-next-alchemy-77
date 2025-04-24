
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ConversionState, ConversionContextType, ConversionOptions } from '@/types/conversion';

// Define action types
type ActionType =
  | { type: 'SET_IS_CONVERTING'; payload: boolean }
  | { type: 'SET_CONVERSION_OPTIONS'; payload: ConversionOptions }
  | { type: 'SET_CONVERSION_PROGRESS'; payload: { progress: number; message: string } }
  | { type: 'SET_PROJECT_DATA'; payload: { files: File[]; packageJson?: any } }
  | { type: 'SET_ORIGINAL_CODE'; payload: string }
  | { type: 'SET_CONVERTED_CODE'; payload: string }
  | { type: 'SET_CONVERSION_RESULT'; payload: any }
  | { type: 'SET_CONVERSION_ERROR'; payload: string }
  | { type: 'RESET_CONVERSION_STATE' };

const defaultConversionOptions: ConversionOptions = {
  useReactRouter: true,
  convertApiRoutes: true,
  transformDataFetching: true,
  replaceComponents: true,
  updateDependencies: true,
  preserveTypeScript: true,
  handleMiddleware: true,
};

const initialState: ConversionState = {
  isConverting: false,
  conversionOptions: defaultConversionOptions,
  progress: 0,
  message: '',
};

const ConversionContext = createContext<ConversionContextType | undefined>(undefined);

const conversionReducer = (state: ConversionState, action: ActionType): ConversionState => {
  switch (action.type) {
    case 'SET_IS_CONVERTING':
      return { ...state, isConverting: action.payload };
    case 'SET_CONVERSION_OPTIONS':
      return { ...state, conversionOptions: action.payload };
    case 'SET_CONVERSION_PROGRESS':
      return { 
        ...state, 
        progress: action.payload.progress, 
        message: action.payload.message 
      };
    case 'SET_PROJECT_DATA':
      return { ...state, projectData: action.payload };
    case 'SET_ORIGINAL_CODE':
      return { ...state, originalCode: action.payload };
    case 'SET_CONVERTED_CODE':
      return { ...state, convertedCode: action.payload };
    case 'SET_CONVERSION_RESULT':
      return { ...state, conversionResult: action.payload };
    case 'SET_CONVERSION_ERROR':
      return { ...state, conversionError: action.payload };
    case 'RESET_CONVERSION_STATE':
      return { 
        ...initialState, 
        conversionOptions: state.conversionOptions 
      };
    default:
      return state;
  }
};

export const ConversionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(conversionReducer, initialState);

  return (
    <ConversionContext.Provider value={{ state, dispatch }}>
      {children}
    </ConversionContext.Provider>
  );
};

export const useConversion = (): ConversionContextType => {
  const context = useContext(ConversionContext);
  if (context === undefined) {
    throw new Error('useConversion must be used within a ConversionProvider');
  }
  return context;
};
