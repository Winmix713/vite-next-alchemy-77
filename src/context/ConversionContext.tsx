
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ConversionState = {
  originalCode: string;
  convertedCode: string;
  conversionOptions: {
    useReactRouter: boolean;
    convertApiRoutes: boolean;
    transformDataFetching: boolean;
    replaceComponents: boolean;
    updateDependencies: boolean;
    preserveTypeScript: boolean;
  };
};

type ConversionContextType = {
  state: ConversionState;
  updateOriginalCode: (code: string) => void;
  updateConvertedCode: (code: string) => void;
  toggleOption: (option: keyof ConversionState['conversionOptions']) => void;
};

const defaultState: ConversionState = {
  originalCode: '',
  convertedCode: '',
  conversionOptions: {
    useReactRouter: true,
    convertApiRoutes: true,
    transformDataFetching: true,
    replaceComponents: true,
    updateDependencies: true,
    preserveTypeScript: true,
  },
};

const ConversionContext = createContext<ConversionContextType | undefined>(undefined);

export const ConversionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConversionState>(defaultState);

  const updateOriginalCode = (code: string) => {
    setState(prevState => ({ ...prevState, originalCode: code }));
  };

  const updateConvertedCode = (code: string) => {
    setState(prevState => ({ ...prevState, convertedCode: code }));
  };

  const toggleOption = (option: keyof ConversionState['conversionOptions']) => {
    setState(prevState => ({
      ...prevState,
      conversionOptions: {
        ...prevState.conversionOptions,
        [option]: !prevState.conversionOptions[option],
      },
    }));
  };

  return (
    <ConversionContext.Provider value={{ state, updateOriginalCode, updateConvertedCode, toggleOption }}>
      {children}
    </ConversionContext.Provider>
  );
};

export const useConversion = () => {
  const context = useContext(ConversionContext);
  if (context === undefined) {
    throw new Error('useConversion must be used within a ConversionProvider');
  }
  return context;
};
