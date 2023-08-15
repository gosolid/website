import React from 'react';
import { ReactComponent as MenuIcon } from './menu.svg';
import * as styles from './index.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

export const MenuButton = ({ className, left, right, up, down }) => {
  return (
    <div className={cx('menuButton', className, { left, right, up, down })}>
      <MenuIcon />
    </div>
  );
};
