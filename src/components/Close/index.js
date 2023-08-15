import React from 'react';
import { ReactComponent as CloseIcon } from './close.svg';
import * as styles from './index.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

export const Close = ({ className, left, right, up, down }) => {
  return (
    <div className={cx('close', className, { left, right, up, down })}>
      <CloseIcon />
    </div>
  );
};
