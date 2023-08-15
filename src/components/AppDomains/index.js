import React, { useEffect, useState } from 'react';
import parseUrl from 'url-parse';

export const AppDomains = ({ url, children }) => {
  const [config, setConfig] = useState();

  useEffect(() => {
    let cancel = false;

    (async () => {
      const response = await fetch(url);
      if (cancel) {
        return;
      }
      const json = await response.json();
      if (cancel) {
        return;
      }
      setConfig(json);
    })();

    return () => {
      cancel = true;
    };
  }, []);

  const isAppDomain = url => {
    if (!(url.startsWith('http:') || url.startsWith('https:'))) {
      return false;
    }

    let { hostname } = parseUrl(url);

    return !!config.appDomains.find(
      domain => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  };

  const isAllowedDomain = url => {
    if (!(url.startsWith('http:') || url.startsWith('https:'))) {
      return false;
    }

    let { hostname } = parseUrl(url);

    return !!config.allowedDomains.find(
      domain => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  };

  const onClick = async event => {
    const element = event.target?.closest('a');

    if (!element) {
      return;
    }

    if (!document.documentElement.classList.contains('mobile-app')) {
      return;
    }

    if (element.tagName !== 'A') {
      return;
    }

    if (isAppDomain(element.href)) {
      return;
    }

    if (!isAllowedDomain(element.href)) {
      return;
    }

    try {
      event.preventDefault();
      const response = await fetch(element.href, {
        method: 'HEAD',
        mode: 'no-cors',
        redirect: 'follow',
      });

      try {
        if (response.redirected && isAppDomain(response.url)) {
          window.location.href = response.url.toString();
          return;
        }
      } catch (err) {
        console.error(err);
      }

      window.location.href = element.href;
    } catch (err) {}
  };

  useEffect(() => {
    document.body.addEventListener('click', onClick, false);
    return () => {
      document.body.removeEventListener('click', onClick, false);
    };
  }, [config]);

  return <>{children}</>;
};
