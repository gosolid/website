import { useEffect } from 'react';
import smartquotes from 'smartquotes';

const SmartQuotes = ({ children }) => {
  useEffect(() => {
    const observer = smartquotes().listen();
    return () => observer.disconnect();
  }, []);

  return children;
};

export { SmartQuotes };
