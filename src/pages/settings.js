import React, { useState, useEffect } from 'react';
import { parse as parseCookie } from 'cookie';
import { Checkbox } from '../components/Checkbox';
import { Analytics } from '../components/Analytics';
import Helmet from 'react-helmet';
import { Header } from '../components/Header';
import * as styles from './settings.module.scss';
import classNames from 'classnames/bind';
import { graphql } from 'gatsby';

const cx = classNames.bind(styles);
function setCookie(name, value) {
  const expires = new Date();
  expires.setTime(expires.getTime() + 10 * 366 * 24 * 3600 * 1000);
  document.cookie =
    name +
    '=' +
    (value || '') +
    '; Expires=' +
    expires.toUTCString() +
    `; Domain=${location.hostname};${
      location.protocol === 'https:' ? ' Secure;' : ''
    } Path=/`;
}

export default function Settings({ data }) {
  console.info(data);
  const { siteUrl } = data.site.siteMetadata;

  const analyticsInitialValue =
    typeof document === 'undefined'
      ? false
      : parseCookie(document.cookie)['analytics'] !== 'false';

  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const handler = () => {
      setAnalytics(parseCookie(document.cookie)['analytics'] !== 'false');
    };
    const interval = setInterval(handler, 1000);
    handler();
    return () => clearInterval(interval);
  }, []);

  const onChangeAnalytics = value => {
    setAnalytics(analytics => {
      analytics = value;
      if (value) {
        setCookie('analytics', 'true');
        window.location.reload();
      } else {
        setCookie('analytics', 'false');
        window.location.reload();
      }
      return analytics;
    });
  };

  return (
    <>
      <Analytics />
      <Helmet title={`Settings | Solid`}>
        <link rel="canonical" href={`https://gosolid.dev/settings`} />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <Header />
      <div className={cx('page')}>
        <div className={cx('wrapper')}>
          <div className={cx('post')}>
            <section itemProp="articleBody" className={cx('articleBody')}>
              <h1>Settings</h1>
              <p>Here you can configure the diary settings.</p>
              <h2>Configure analytics</h2>
              <Checkbox value={analytics} onChange={onChangeAnalytics}>
                Analytics
              </Checkbox>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        siteUrl
      }
    }
  }
`;
