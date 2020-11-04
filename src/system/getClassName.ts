// @ts-nocheck
/**
 *  Creates or returns classNames
 */

import checkTheme from '../theme/checkTheme';
import hash from '../utilities/hash';
import { ifStrToKebabCase } from '../utilities/ifStrToKebabCase';
import { isDev } from '../utilities/is';
import getPrecedence from './getPrecedence';
import { themeInternal as theme } from './setup';
import updateSheet from './updateSheet';

export const CACHE_CLASSNAMES = new Map();
const usedClassNames = new Map();

const mediaClassNames = ['sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'];

const getClassName = (
  propertyCamelCased: string,
  value: string | number,
  media: string | undefined | number = '',
  selector: string | undefined = '',
  mediaQuery?: string // mediaArr?: Array<string | number | null> | false
) => {
  const property = ifStrToKebabCase(propertyCamelCased);
  const key = `${media}${selector}${property}${value}${mediaQuery}`; // ${!mediaArr ? value : mediaArr}`;

  const precedence = getPrecedence(property as string, selector);

  let className = CACHE_CLASSNAMES.get(key);
  if (!className) {
    const themedValue = checkTheme(property, value);

    let devClassName = '';

    if (isDev) {
      if (typeof value === 'object') {
        // eslint-disable-next-line no-console
        console.error(
          'The CSS value is an Object. This might be because you nested a key inside the "css" prop. It is only possible for pseudo and media keys.',
          property,
          value
        );
      }

      const mediaByNaming =
        (media.length > 0
          ? `${
              mediaClassNames[theme.breakpoints.indexOf(media)] || `m${media}`
            }\\:`
          : mediaQuery && `Q-${mediaQuery.replace(/[():;% ]/g, '')}\\:`) ?? '';

      devClassName = `${mediaByNaming}${
        selector && selector.length > 3
          ? `${selector.replace(/[&:]/g, '').trim().replace(' ', '-')}\\:`
          : ''
      }${property}-${themedValue})`.replace(
        /[~!$%^&*()+=,.';"?/><[\]{}`# ]/g,
        ''
      );
      const usedClassName = usedClassNames.get(devClassName);

      if (usedClassName && selector.length > 0) {
        devClassName += usedClassName;
        usedClassNames.set(devClassName, usedClassName + 1);
      } else {
        usedClassNames.set(devClassName, 1);
      }
    }

    className = !isDev
      ? hash(`${selector}${property}${themedValue || ''}${mediaQuery || media}`) // ${!mediaArr ? themedValue : mediaArr}`)
      : devClassName;

    updateSheet(`.${className}`.repeat(precedence), {
      property,
      value: themedValue,
      media,
      selector,
      mediaQuery
    });

    const sanitizedClassName = !isDev
      ? className
      : className.replace(/\\:/g, ':');

    CACHE_CLASSNAMES.set(key, sanitizedClassName);

    return sanitizedClassName;
  }

  return className;
};

export default getClassName;
