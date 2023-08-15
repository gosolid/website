import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as styles from './index.module.scss';
import classNames from 'classnames/bind';
import { useState } from 'react';

const cx = classNames.bind(styles);

export const Video = ({ video }) => {
  const [render, setRender] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRender(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  const el = useRef();
  const [show, setShow] = useState(false);
  const fullscreen = useMemo(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    return container;
  }, []);
  const elfs = useRef();

  useEffect(() => {
    if (!el.current || !elfs.current) {
      return;
    }

    if (!render) {
      return;
    }

    el.current.addEventListener(
      'mouseenter',
      () => {
        try {
          el.current?.play().catch(() => {});
        } catch (err) {}
      },
      false
    );

    el.current.addEventListener(
      'mouseleave',
      () => {
        try {
          el.current?.pause();
        } catch (err) {}
      },
      false
    );

    el.current.addEventListener(
      'click',
      () => {
        setShow(true);
        try {
          elfs.current?.play().catch(() => {});
          if (el.current) {
            el.current?.pause();
            el.current.currentTime = 0;
          }
        } catch (err) {}
      },
      false
    );

    fullscreen.addEventListener(
      'click',
      () => {
        if (elfs.current) {
          elfs.current?.pause();
          elfs.current.currentTime = 0;
          elfs.current.load();
        }
        setShow(false);
      },
      false
    );

    elfs.current.addEventListener('pause', () => {
      if (elfs.current) {
        elfs.current?.pause();
        elfs.current.currentTime = 0;
      }
      setShow(false);
    });

    return () => {
      fullscreen.remove();
    };
  }, [render]);

  return (
    <>
      <video
        poster={video.derivatives.PosterFrame.url}
        muted
        loop
        playsinline
        ref={el}
        className={cx({ hidden: !render })}
      >
        <source src={video.derivatives['360p'].url} />
      </video>

      {createPortal(
        <div className={cx('fullscreen', { show })}>
          <video
            poster={video.derivatives.PosterFrame.url}
            loop
            playsinline
            ref={elfs}
            className={cx({ hidden: !render })}
          >
            <source src={video.derivatives['720p'].url} />
          </video>
        </div>,
        fullscreen
      )}
    </>
  );
};

export const Photo = ({ photo }) => {
  if (photo.mediaAssetType === 'video') {
    return <Video video={photo} />;
  }

  const [render, setRender] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRender(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  const el = useRef();
  const [show, setShow] = useState(false);
  const fullscreen = useMemo(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    return container;
  }, []);

  useEffect(() => {
    if (!render) {
      return;
    }
    if (!el.current) {
      return;
    }

    el.current.addEventListener(
      'click',
      () => {
        setShow(true);
      },
      []
    );

    fullscreen.addEventListener(
      'click',
      () => {
        setShow(false);
      },
      []
    );
  }, [render]);

  const derivative = photo.derivatives[Object.keys(photo.derivatives)[0]];
  const lastDerivative =
    photo.derivatives[Object.keys(photo.derivatives).reverse()[0]];

  if (!render) {
    return null;
  }

  return (
    <>
      <img src={derivative.url} ref={el} className={cx({ hidden: !render })} />
      {createPortal(
        <div className={cx('fullscreen', { show })}>
          <img src={lastDerivative.url} className={cx({ hidden: !render })} />
        </div>,
        fullscreen
      )}
    </>
  );
};
