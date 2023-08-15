import React, { createContext, useContext, useState } from 'react';
import { createComposableWithProps } from '@grexie/compose';

const EncryptedContext = createContext();

const EncryptedProvider = ({ encrypted, children }) => {
  const [decrypted, setDecrypted] = useState(!encrypted);

  return (
    <EncryptedContext.Provider value={{ decrypted, setDecrypted }}>
      {children}
    </EncryptedContext.Provider>
  );
};

const useEncrypted = () => useContext(EncryptedContext);

const withEncryptedProvider = createComposableWithProps(EncryptedProvider);

export { EncryptedProvider, useEncrypted, withEncryptedProvider };
