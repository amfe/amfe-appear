'use strict';

/**
 * @module amfeAppear
 */

/**
 * @requires class:Appear
 */
import appear from './appear';

const version = '1.0.0';
/*eslint-disable no-alert, no-console */

/* istanbul ignore if */
if (typeof alert === 'function' && typeof console === 'object') {
    console.log('bar');
}

/*eslint-enable no-alert, no-console */

export {
  /**
   * version
   * @type {string}
   */
  version,
  /**
   * @type {Appear}
   */
  appear
};