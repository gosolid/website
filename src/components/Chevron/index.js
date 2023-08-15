import React from 'react';
import { ReactComponent as ChevronIcon } from './left-chevron.svg';
import * as styles from './index.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

export const Chevron = ({ className, left, right, up, down }) => {
  return (
    <div className={cx('chevron', className, { left, right, up, down })}>
      <ChevronIcon />
    </div>
  );
};
