import React from 'react';
import { SmartQuotes } from './src/components/SmartQuotes';
import { ImportStaticQueryProvider } from './src/hooks/useShortcodes/useImports';

export const wrapPageElement = ({ element }) => {
  return (
    <ImportStaticQueryProvider>
      <SmartQuotes>{element}</SmartQuotes>
    </ImportStaticQueryProvider>
  );
};
