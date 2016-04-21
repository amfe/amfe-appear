'use strict';

/**
 * @module amfeAppear
 */

/**
 * @requires class:Appear
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appear = exports.version = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _appear = require('./appear');

var _appear2 = _interopRequireDefault(_appear);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var version = '1.0.0';
/*eslint-disable no-alert, no-console */

/* istanbul ignore if */
if (typeof alert === 'function' && (typeof console === 'undefined' ? 'undefined' : _typeof(console)) === 'object') {
  console.log('bar');
}

/*eslint-enable no-alert, no-console */

exports.
/**
 * version
 * @type {string}
 */
version = version;
exports.
/**
 * @type {Appear}
 */
appear = _appear2.default;