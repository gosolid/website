import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'gatsby';
import menu from '../../../content/menu.json';
import { Translate } from 'components/Translate';
import { flattenedCategories } from '../../utils/categories';
import { useStaticQuery, graphql } from 'gatsby';
import { Chevron } from '../Chevron';
import { MenuButton } from '../MenuButton';
import { Close } from '../Close';
import { useMobileApp } from '../../hooks/useMobileApp';
import { Logo } from '../Logo';

import * as styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const useIsomorphicEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const Menu = ({ item, children }) => {
  const [expand, setExpand] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = event => {
      if (!ref.current.contains(event.target)) {
        setExpand(false);
      }
      if (event.target.href) {
        setExpand(false);
      }
    };

    window.addEventListener('click', handler, false);
    return () => window.removeEventListener('click', handler, false);
  }, []);

  const onClick = () => {
    setExpand(expand => !expand);
  };

  return (
    <li className={cx('menuItem', { expand })} ref={ref}>
      <span onClick={onClick}>
        {item.slug && (
          <Link to={item.slug}>
            {item.title}{' '}
            {!!children.length && <Chevron down className={cx('chevron')} />}
          </Link>
        )}
        {item.href && (
          <a href={item.href} target="_blank">
            {item.title}{' '}
            {!!children.length && <Chevron down className={cx('chevron')} />}
          </a>
        )}
        {!item.slug && !item.href && (
          <a>
            {item.title}{' '}
            {!!children.length && <Chevron down className={cx('chevron')} />}
          </a>
        )}
      </span>

      {!!children.length && <ul className={cx('subMenu')}>{children}</ul>}
    </li>
  );
};

const Header = ({
  className = '',
  disableAnalytics = false,
  twitter,
  facebook,
}) => {
  const { site } = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
    }
  `);

  const desktopMenu = [];
  const mobileMenu = [];
  const [show, setShow] = useState(false);

  useMobileApp();

  useIsomorphicEffect(() => {
    if (disableAnalytics) {
      window.gtag = () => {};
    }
  }, []);

  useEffect(() => {
    if (show) {
      document.body.classList.add('no-scroll');

      const handler = () => {
        setShow(false);
      };

      window.addEventListener('resize', handler, false);
      return () => window.removeEventListener('resize', handler, false);
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [show]);

  const onClickMenu = () => {
    setShow(true);
  };

  const renderItem = (item, key, out, subMenu = false) => {
    const _children = item.children;
    const children = [];

    if (typeof item === 'string') {
      item = { category: item };
    }

    if (item.category) {
      item = flattenedCategories.find(({ slug }) => slug === item.category);
      item = {
        slug: item.default ? '/' : `/${item?.slug}`,
        title: item?.name,
      };
    }

    _children?.forEach((item, i) => {
      renderItem(item, `${key}-${i}`, children, true);
    });

    out.push(
      <Menu key={key} item={item}>
        {children}
      </Menu>
    );
  };

  menu.forEach((item, i) => {
    renderItem(item, `${i}`, desktopMenu);
    renderItem(item, `${i}`, mobileMenu);
  });

  const onClickBackground = () => setShow(false);
  const onClickClose = () => setShow(false);

  const onClickBack = () => history.go(-1);
  const onClickForward = () => history.go(1);

  return (
    <>
      <Helmet>
        <meta name="theme-color" content="#eee" />
        <script>
          {`
            if (typeof localStorage !== 'undefined' && localStorage.getItem('mobile-app') === 'true') {
              document.documentElement.classList.add('mobile-app');
            }
          `}
        </script>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="light-content"
        />
        <link rel="preload" as="image" href="/icons/solid.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="preload"
          as="style"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <link
          rel="icon"
          type="image/jpeg"
          href="/icons/madonna-of-the-lilies.jpeg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@grexie" />
        <meta name="twitter:creator" content="@grexie" />
        <meta
          name="twitter:image"
          content={
            twitter?.replace(/^\//, 'https://gosolid.dev/') ??
            'https://gosolid.dev/cards/twitter/default.jpeg'
          }
        />
        <meta
          name="og:image"
          content={
            facebook?.replace(/^\//, 'https://gosolid.dev/') ??
            'https://gosolid.dev/cards/facebook/default.jpeg'
          }
        />
      </Helmet>

      <div className={cx('header', className)} style={{ maxWidth: '100vw' }}>
        <div className={cx('menuRow', 'mobile-app')}>
          <button
            className={cx('menuButton', 'mobile-app')}
            onClick={onClickBack}
          >
            <Chevron left />
          </button>
          <button
            className={cx('menuButton', 'mobile-app')}
            onClick={onClickForward}
          >
            <Chevron right />
          </button>
        </div>
        <Link to="/" className={cx('logo')}>
          <Logo />
          <h1>Solid</h1>
        </Link>
        <div className={cx('spacer')} />
        <div className={cx('menuRow')}>
          <ul className={cx('menu')}>{desktopMenu}</ul>
          <div className={cx('translate')}>
            <Translate />
          </div>
          <button
            className={cx('menuButton', 'mobileMenuButton')}
            onClick={onClickMenu}
          >
            <MenuButton />
          </button>
        </div>
      </div>
      <div className={cx('mobileMenu', { show })}>
        <div className={cx('closeButton')}>
          <button className={cx('menuButton')} onClick={onClickClose}>
            <Close />
          </button>
        </div>
        <div className={cx('translate')}>
          <Translate />
        </div>
        <ul className={cx('menu')}>{mobileMenu}</ul>
      </div>
      <div className={cx('mobileMenuBackground')} onClick={onClickBackground} />
    </>
  );
};

export { Header, flattenedCategories };
