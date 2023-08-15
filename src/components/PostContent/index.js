import React, { useState, useLayoutEffect } from 'react';
import CryptoJS from 'crypto-js';
import { decode } from 'html-entities';
import { useEncrypted } from '../../hooks/useEncrypted';
import { useShortcodes } from '../../hooks/useShortcodes';
import smartquotes from 'smartquotes';
import * as styles from './index.module.scss';
import classNames from 'classnames/bind';
import { useEffect } from 'react';
import { emoji } from '../../utils/emoji';

const cx = classNames.bind(styles);
const PASSWORD_VERSION = 'v1';

const useIsomorphicEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const PostContent = ({ html, encrypted, hasDecrypted }) => {
  const [initialized, setInitialized] = useState(false);
  let [decryptedContent, setDecryptedContent] = useState(
    encrypted ? null : html
  );
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const { setDecrypted } = useEncrypted();

  decryptedContent = useShortcodes(decryptedContent);

  useIsomorphicEffect(() => {
    setInitialized(true);

    if (!encrypted) {
      setDecrypted(true);
      return;
    }

    const hash = window.location.hash;
    let password;
    if (hash.startsWith('#!password=')) {
      password = hash.trim().replace(/^#!password=/, '');
      localStorage.setItem('last-password', password);
      localStorage.setItem('last-password-version', PASSWORD_VERSION);
      window.location.hash = '';
    } else {
      if (localStorage.getItem('last-password-version') === PASSWORD_VERSION) {
        password = localStorage.getItem('last-password');
      } else {
        localStorage.removeItem('last-password');
        localStorage.removeItem('last-password-version');
      }
    }

    if (password) {
      try {
        const content = CryptoJS.AES.decrypt(html, password).toString(
          CryptoJS.enc.Utf8
        );

        if (!content) {
          throw new Error();
        }

        setDecryptedContent(content);
        setPassword(password);
        setDecrypted(true);
      } catch (e) {
        localStorage.removeItem('last-password');
        localStorage.removeItem('last-password-version');
      }
    }
  }, []);

  const onClearPassword = () => {
    localStorage.removeItem('last-password');
    localStorage.removeItem('last-password-version');
    setError(null);
    setDecrypted(false);
    setDecryptedContent(null);
    setPassword('');
  };

  const onSubmitPassword = () => {
    try {
      const content = CryptoJS.AES.decrypt(html, password).toString(
        CryptoJS.enc.Utf8
      );

      if (!content) {
        throw new Error();
      }

      localStorage.setItem('last-password', password);
      localStorage.setItem('last-password-version', PASSWORD_VERSION);
      setDecryptedContent(content);
      setDecrypted(true);
      setError(null);
    } catch (e) {
      setError('The password you entered is not correct');
    }
  };

  if (encrypted && !initialized) {
    return null;
  }

  return decryptedContent !== null ? (
    <>
      {!!encrypted && (
        <div className={cx('lock', 'noprint')}>
          <button className={cx('button')} onClick={onClearPassword}>
            Encrypt
          </button>
        </div>
      )}
      {(!!encrypted || hasDecrypted) && (
        <div className={cx('lock', 'onlyprint')}>
          <button className={cx('button')} onClick={onClearPassword}>
            Encrypted
          </button>
        </div>
      )}
      <section
        dangerouslySetInnerHTML={{ __html: emoji(decode(decryptedContent)) }}
        itemProp="articleBody"
        className={cx('articleBody')}
      />
    </>
  ) : (
    <section itemProp="articleBody" className={cx('passwordInput')}>
      <div>
        Enter the password to access this page, if you have access please enter
        the password you have received:
      </div>
      <div className={cx('row')}>
        <input
          type="text"
          value={password}
          onChange={e => setPassword(e.target.value.toLowerCase())}
          onKeyUp={e => {
            if (e.keyCode === 13) {
              onSubmitPassword();
            }
          }}
        />
        <button className={cx('button')} onClick={onSubmitPassword}>
          Decrypt
        </button>
      </div>
      {!!error && <div className={cx('error')}>{error}</div>}
    </section>
  );
};

export { PostContent };
