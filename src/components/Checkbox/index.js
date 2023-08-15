import React from 'react';

import classNames from 'classnames/bind';
import * as styles from './index.module.scss';
import { CheckRounded } from '@material-ui/icons';
const cx = classNames.bind(styles);

const Checkbox = ({
  id,
  className,
  checkedClassName,
  children,
  value,
  onChange,
}) => {
  const _onChange = event => {
    onChange?.(event.target.checked);
  };

  return (
    <label
      className={cx('checkbox', className, {
        checked: !!value,
        [checkedClassName]: !!value,
      })}
      htmlFor={id}
    >
      <input
        name={id}
        id={id}
        type="checkbox"
        checked={!!value}
        onChange={_onChange}
      />
      <div className={cx('icon')}>
        <div className={cx('inner')}>
          <CheckRounded className={cx('check')} />
        </div>
      </div>
      <span>{children}</span>
    </label>
  );
};

export { Checkbox };
