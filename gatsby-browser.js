import React from 'react';
import { SmartQuotes } from './src/components/SmartQuotes';
import { ImportStaticQueryProvider } from './src/hooks/useShortcodes/useImports';
// import { VeritasClient } from '@grexie/veritas';
// import { VeritasProvider } from '@grexie/veritas/react';

// const client = new VeritasClient({
//   accessToken: '',
// });

export const wrapPageElement = ({ element }) => {
  return (
    // <VeritasProvider client={client}>
    <ImportStaticQueryProvider>
      <SmartQuotes>{element}</SmartQuotes>
    </ImportStaticQueryProvider>
    // </VeritasProvider>
  );
};

export const disableCorePrefetching = () => true;
