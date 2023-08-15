import React, { useEffect } from 'react';
import { parse as cookieParse } from 'cookie';

const Analytics = () => {
  useEffect(() => {
    if (document.head.querySelector('script[data-analytics=true]')) {
      return;
    }

    if (process.env.NODE_ENV === 'production') {
    }
  }, []);

  return <></>;
};

export { Analytics };
