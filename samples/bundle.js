require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var doc = document;
var appearEvt = doc.createEvent("HTMLEvents"); //创建自定义显示事件  ;
var disappearEvt = doc.createEvent("HTMLEvents"); //创建自定义显示事件  ;

function createEvent() {
  appearEvt.initEvent('appear', false, true);
  disappearEvt.initEvent('disappear', false, true);
}

/**
 * [throttle 节流函数]
 * @param  {[function]} func [执行函数]
 * @param  {[int]} wait [等待时长]
 * @return {[type]}      [description]
 */
function throttle(func, wait) {
  var previous = 0,
      //上次执行的时间
  timeout = null,
      //setTimout任务
  args = void 0,
      //参数
  result = void 0; //结果
  var later = function later() {
    previous = Date.now();
    timeout = null; //清空计时器
    func(args);
  };
  return function () {
    var now = Date.now(),
        args = arguments,
        remaining = wait - (now - previous);
    if (remaining <= 0 || remaining >= wait) {
      //如果没有剩余时间，或者存在修改过系统时间导致剩余时间增大的情况，则执行
      clearTimeout(timeout);
      timeout = null;
      result = func(args);
    } else if (timeout === null) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

/**
 * [getOffset 获取边距尺寸]
 * @param  {[type]} el   [description]
 * @param  {[type]} param [description]
 * @return {[type]}       [description]
 */
function getOffset(el, param) {
  var l, r, t, b;
  if (!el) {
    return;
  }
  if (!param) {
    param = {
      x: 0,
      y: 0,
      h: null,
      w: null
    };
  }

  if (el !== window) {
    el = el.getBoundingClientRect();
    l = el.left;
    t = el.top;
    r = el.right;
    b = el.bottom;
  } else {
    l = 0;
    t = 0;
    r = l + el.innerWidth;
    b = t + el.innerHeight;
  }
  param.h = param.h || (el.height || el.innerHeight) - param.y;
  param.w = param.w || (el.width || el.innerWidth) - param.x;
  var offset = {
    'left': l + (el.width || el.innerWidth) - param.w - param.x,
    'top': t + (el.height || el.innerHeight) - param.h - param.y,
    'right': r - param.x,
    'bottom': b - param.y
  };
  return offset;
}

//元素位置比较
function compareOffset(d1, d2) {
  var left = d2.right > d1.left && d2.left < d1.right;
  var top = d2.bottom > d1.top && d2.top < d1.bottom;
  return left && top;
}
//获取移动方向
function getDirection(beforeOffset, nowOffset) {
  var direction = 'none';
  var horizental = beforeOffset.left - nowOffset.left;
  var vertical = beforeOffset.top - nowOffset.top;
  if (vertical === 0) {
    if (horizental !== 0) {
      direction = horizental > 0 ? 'left' : 'right';
    } else {
      direction = 'none';
    }
  }
  if (horizental === 0) {
    if (vertical !== 0) {
      direction = vertical > 0 ? 'up' : 'down';
    } else {
      direction = 'none';
    }
  }
  return direction;
}

function extend(target, el) {
  for (var k in el) {
    if (el.hasOwnProperty(k)) {
      target[k] = el[k];
    }
  }
  return target;
}

/**
 * [__bindEvent 绑定事件，包括滚动、touchmove、transform、resize等]
 * @return {[type]}      [description]
 */
function __bindEvent() {
  var _this = this,
      _arguments = arguments;

  var handle = throttle(function () {
    __fire.apply(_this, _arguments);
  }, this.options.wait);
  if (this.__handle) {
    //避免重复绑定
    this.viewWrapper.removeEventListener('scroll', this.__handle);
    this.__handle = null;
  }
  this.__handle = handle;
  this.viewWrapper.addEventListener('scroll', handle, false);
  this.viewWrapper.addEventListener('resize', function () {
    __fire.apply(_this, _arguments);
  }, false);
  this.viewWrapper.addEventListener('animationEnd', function () {
    __fire.apply(_this, _arguments);
  }, false);
  // android4.0以下
  this.viewWrapper.addEventListener('webkitAnimationEnd', function () {
    __fire.apply(_this, _arguments);
  }, false);
  this.viewWrapper.addEventListener('transitionend', function () {
    __fire.apply(_this, _arguments);
  }, false);
}

//获取容器内所有的加载元素
function __getElements(selector) {
  var _this2 = this;

  //获取视窗容器
  var viewWrapper = this.options.viewWrapper;
  if (typeof viewWrapper === 'string') {
    //如果是字符串，则选择器
    this.viewWrapper = doc.querySelector(viewWrapper);
  } else {
    //对象传值
    this.viewWrapper = viewWrapper;
  }
  var appearWatchElements = void 0;
  //获取容器内的所有目标元素
  if (this.viewWrapper === window) {
    appearWatchElements = doc.querySelectorAll(selector);
  } else {
    appearWatchElements = this.viewWrapper.querySelectorAll(selector);
  }
  appearWatchElements = [].slice.call(appearWatchElements, null);

  appearWatchElements = appearWatchElements.filter(function (ele) {
    // 如果已经绑定过，清除appear状态，不再加入到数组里
    if (ele.dataset.bind === '1') {
      delete ele._hasAppear;
      delete ele._hasDisAppear;
      delete ele._appear;
      ele.classList.remove(_this2.options.cls);
      return false;
    } else {
      return true;
    }
  });

  return appearWatchElements;
}

function __initBoundingRect(elements) {
  var _this3 = this;

  if (elements && elements.length > 0) {
    [].forEach.call(elements, function (ele) {
      ele._eleOffset = getOffset(ele);
      //移除类名
      ele.classList.remove(_this3.options.cls);
      // 标志已经绑定
      ele.dataset.bind = 1;
    });
  }
}

// 触发加载
function __fire() {
  var viewWrapper = this.viewWrapper,
      elements = this.appearWatchElements,
      appearCallback = this.options.onAppear,
      //appear的执行函数
  disappearCallback = this.options.onDisappear,
      //disappear的执行函数
  viewWrapperOffset = getOffset(viewWrapper, {
    x: this.options.x,
    y: this.options.y,
    h: this.options.h,
    w: this.options.w
  }),
      isOnce = this.options.once; //是否只执行一次
  if (elements && elements.length > 0) {
    [].forEach.call(elements, function (ele) {
      //获取左右距离
      var eleOffset = getOffset(ele),
          direction = getDirection(ele._eleOffset, eleOffset);
      //保存上个时段的位置信息
      ele._eleOffset = eleOffset;
      //查看是否在可视区域范围内
      var isInView = compareOffset(viewWrapperOffset, eleOffset),
          appear = ele._appear,
          _hasAppear = ele._hasAppear,
          _hasDisAppear = ele._hasDisAppear;
      appearEvt.data = {
        direction: direction,
        eleOffset: eleOffset
      };
      disappearEvt.data = {
        direction: direction,
        eleOffset: eleOffset
      };
      if (isInView && !appear) {
        if (isOnce && !_hasAppear || !isOnce) {
          //如果只触发一次并且没有触发过或者允许触发多次
          //如果在可视区域内，并且是从disppear进入appear，则执行回调
          var appearFn = function appearFn(ev) {
            appearCallback && appearCallback.call(ele, ev);
            ele.removeEventListener('appear', appearFn);
          };
          ele.addEventListener('appear', appearFn);

          //触发自定义事件
          ele.dispatchEvent(appearEvt);
          ele._hasAppear = true;
          ele._appear = true;
        }
      } else if (!isInView && appear) {
        if (isOnce && !_hasDisAppear || !isOnce) {
          //如果不在可视区域内，并且是从appear进入disappear，执行disappear回调
          var disappearFn = function disappearFn(ev) {
            disappearCallback && disappearCallback.call(ele, ev);
            ele.removeEventListener('disappear', disappearFn);
          };
          ele.addEventListener('disappear', disappearFn);

          //触发自定义事件
          ele.dispatchEvent(disappearEvt);
          ele._hasDisAppear = true;
          ele._appear = false;
        }
      }
    });
  }
}

function __init(opts) {
  //扩展参数
  extend(this.options, opts || (opts = {}));
  //获取目标元素
  this.appearWatchElements = this.appearWatchElements || __getElements.call(this, "." + this.options.cls);
  //初始化位置信息
  __initBoundingRect.call(this, this.appearWatchElements);
  //绑定事件
  __bindEvent.call(this);
}

var Appear = function () {
  function Appear() {
    _classCallCheck(this, Appear);

    //默认参数
    this.options = {
      viewWrapper: window,
      wait: 100,
      x: 0,
      y: 0,
      w: null,
      h: null,
      cls: 'amfe-appear',
      once: false,
      onAppear: function onAppear() {},
      onDisappear: function onDisappear() {}
    };
    this.viewWrapper = null;
    this.appearWatchElements = null;
    __init.apply(this, arguments);
  }

  _createClass(Appear, [{
    key: "bind",
    value: function bind(node) {
      var cls = this.options.cls;
      // 添加需要绑定的appear元素
      if (typeof node === 'string') {
        var elements = __getElements.call(this, node);
        [].forEach.call(elements, function (ele) {
          if (!ele.classList.contains(cls)) {
            ele.classList.add(cls);
          }
        });
      } else if (node.nodeType === 1 && (this.viewWrapper === window || this.viewWrapper.contains(node))) {
        //如果传入的是元素并且在包含在容器中，直接添加类名
        if (!node.classList.contains(cls)) {
          //添加类名
          node.classList.add(cls);
        }
      } else {
        return this;
      }
      //新增的子元素
      var newElements = __getElements.call(this, "." + this.options.cls);
      //对缓存的子元素做增量
      this.appearWatchElements = this.appearWatchElements.concat(newElements);
      //初始化新子元素的位置信息
      __initBoundingRect.call(this, newElements);
      return this;
    }
    // 重置函数

  }, {
    key: "reset",
    value: function reset(opts) {
      __init.call(this, opts);
      this.appearWatchElements.forEach(function (ele) {
        delete ele._hasAppear;
        delete ele._hasDisAppear;
        delete ele._appear;
      });
      return this;
    }
  }, {
    key: "fire",
    value: function fire() {
      if (!this.appearWatchElements) {
        this.appearWatchElements = [];
      }
      var newElements = __getElements.call(this, "." + this.options.cls);
      this.appearWatchElements = this.appearWatchElements.concat(newElements);
      //初始化位置信息
      __initBoundingRect.call(this, newElements);
      __fire.call(this);
      return this;
    }
  }]);

  return Appear;
}();

var appear = {
  instances: [],
  init: function init(opts) {
    var instance = new Appear(opts);
    this.instances.push(instance);
    return instance;
  },
  fireAll: function fireAll() {
    var instances = this.instances;
    instances.forEach(function (instance) {
      instance.fire();
    });
  }
};
//注册事件
createEvent();

exports.default = appear;

},{}],"amfe-appear":[function(require,module,exports){
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

},{"./appear":1}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwZWFyLmpzIiwic3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7Ozs7Ozs7QUFFQSxJQUFNLE1BQU0sUUFBTjtBQUNOLElBQU0sWUFBWSxJQUFJLFdBQUosQ0FBZ0IsWUFBaEIsQ0FBWjtBQUNOLElBQU0sZUFBZSxJQUFJLFdBQUosQ0FBZ0IsWUFBaEIsQ0FBZjs7QUFFTixTQUFTLFdBQVQsR0FBdUI7QUFDckIsWUFBVSxTQUFWLENBQW9CLFFBQXBCLEVBQThCLEtBQTlCLEVBQXFDLElBQXJDLEVBRHFCO0FBRXJCLGVBQWEsU0FBYixDQUF1QixXQUF2QixFQUFvQyxLQUFwQyxFQUEyQyxJQUEzQyxFQUZxQjtDQUF2Qjs7Ozs7Ozs7QUFXQSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEI7QUFDNUIsTUFBSSxXQUFXLENBQVg7O0FBQ0YsWUFBVSxJQUFWOztBQUNBLGVBRkY7O0FBR0UsaUJBSEY7QUFENEIsTUFLdEIsUUFBUSxTQUFSLEtBQVEsR0FBTTtBQUNsQixlQUFXLEtBQUssR0FBTCxFQUFYLENBRGtCO0FBRWxCLGNBQVUsSUFBVjtBQUZrQixRQUdsQixDQUFLLElBQUwsRUFIa0I7R0FBTixDQUxjO0FBVTVCLFNBQU8sWUFBVztBQUNoQixRQUFJLE1BQU0sS0FBSyxHQUFMLEVBQU47UUFDRixPQUFPLFNBQVA7UUFDQSxZQUFZLFFBQVEsTUFBTSxRQUFOLENBQVIsQ0FIRTtBQUloQixRQUFJLGFBQWEsQ0FBYixJQUFrQixhQUFhLElBQWIsRUFBbUI7O0FBRXZDLG1CQUFhLE9BQWIsRUFGdUM7QUFHdkMsZ0JBQVUsSUFBVixDQUh1QztBQUl2QyxlQUFTLEtBQUssSUFBTCxDQUFULENBSnVDO0tBQXpDLE1BS08sSUFBSSxZQUFZLElBQVosRUFBa0I7QUFDM0IsZ0JB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QUFQLENBUFU7Ozs7MkJBU0w7QUFDTCxVQUFJLENBQUMsS0FBSyxtQkFBTCxFQUEwQjtBQUM3QixhQUFLLG1CQUFMLEdBQTJCLEVBQTNCLENBRDZCO09BQS9CO0FBR0EsVUFBSSxjQUFjLGNBQWMsSUFBZCxDQUFtQixJQUFuQixRQUE2QixLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQTNDLENBSkM7QUFLTCxXQUFLLG1CQUFMLEdBQTJCLEtBQUssbUJBQUwsQ0FBeUIsTUFBekIsQ0FBZ0MsV0FBaEMsQ0FBM0I7O0FBTEssd0JBT0wsQ0FBbUIsSUFBbkIsQ0FBd0IsSUFBeEIsRUFBOEIsV0FBOUIsRUFQSztBQVFMLGFBQU8sSUFBUCxDQUFZLElBQVosRUFSSztBQVNMLGFBQU8sSUFBUCxDQVRLOzs7O1NBekRIOzs7QUFzRU4sSUFBTSxTQUFTO0FBQ2IsYUFBVyxFQUFYO0FBQ0Esc0JBQUssTUFBTTtBQUNULFFBQUksV0FBVyxJQUFJLE1BQUosQ0FBVyxJQUFYLENBQVgsQ0FESztBQUVULFNBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsUUFBcEIsRUFGUztBQUdULFdBQU8sUUFBUCxDQUhTO0dBRkU7QUFPYiw4QkFBVTtBQUNSLFFBQUksWUFBWSxLQUFLLFNBQUwsQ0FEUjtBQUVSLGNBQVUsT0FBVixDQUFrQixVQUFDLFFBQUQsRUFBYztBQUM5QixlQUFTLElBQVQsR0FEOEI7S0FBZCxDQUFsQixDQUZRO0dBUEc7Q0FBVDs7QUFlTjs7a0JBRWU7OztBQ2xYZjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTQTs7Ozs7O0FBRUEsSUFBTSxVQUFVLE9BQVY7Ozs7QUFJTixJQUFJLE9BQU8sS0FBUCxLQUFpQixVQUFqQixJQUErQixRQUFPLHlEQUFQLEtBQW1CLFFBQW5CLEVBQTZCO0FBQzVELFVBQVEsR0FBUixDQUFZLEtBQVosRUFENEQ7Q0FBaEU7Ozs7Ozs7OztBQVdFOzs7OztBQUlBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZG9jID0gZG9jdW1lbnQ7XG5jb25zdCBhcHBlYXJFdnQgPSBkb2MuY3JlYXRlRXZlbnQoXCJIVE1MRXZlbnRzXCIpOyAvL+WIm+W7uuiHquWumuS5ieaYvuekuuS6i+S7tiAgO1xuY29uc3QgZGlzYXBwZWFyRXZ0ID0gZG9jLmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTsgLy/liJvlu7roh6rlrprkuYnmmL7npLrkuovku7YgIDtcblxuZnVuY3Rpb24gY3JlYXRlRXZlbnQoKSB7XG4gIGFwcGVhckV2dC5pbml0RXZlbnQoJ2FwcGVhcicsIGZhbHNlLCB0cnVlKTtcbiAgZGlzYXBwZWFyRXZ0LmluaXRFdmVudCgnZGlzYXBwZWFyJywgZmFsc2UsIHRydWUpO1xufVxuXG4vKipcbiAqIFt0aHJvdHRsZSDoioLmtYHlh73mlbBdXG4gKiBAcGFyYW0gIHtbZnVuY3Rpb25dfSBmdW5jIFvmiafooYzlh73mlbBdXG4gKiBAcGFyYW0gIHtbaW50XX0gd2FpdCBb562J5b6F5pe26ZW/XVxuICogQHJldHVybiB7W3R5cGVdfSAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCkge1xuICBsZXQgcHJldmlvdXMgPSAwLCAvL+S4iuasoeaJp+ihjOeahOaXtumXtFxuICAgIHRpbWVvdXQgPSBudWxsLCAvL3NldFRpbW91dOS7u+WKoVxuICAgIGFyZ3MsIC8v5Y+C5pWwXG4gICAgcmVzdWx0OyAvL+e7k+aenFxuICBjb25zdCBsYXRlciA9ICgpID0+IHtcbiAgICBwcmV2aW91cyA9IERhdGUubm93KCk7XG4gICAgdGltZW91dCA9IG51bGw7IC8v5riF56m66K6h5pe25ZmoXG4gICAgZnVuYyhhcmdzKTtcbiAgfTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBub3cgPSBEYXRlLm5vdygpLFxuICAgICAgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPj0gd2FpdCkge1xuICAgICAgLy/lpoLmnpzmsqHmnInliankvZnml7bpl7TvvIzmiJbogIXlrZjlnKjkv67mlLnov4fns7vnu5/ml7bpl7Tlr7zoh7TliankvZnml7bpl7Tlop7lpKfnmoTmg4XlhrXvvIzliJnmiafooYxcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYyhhcmdzKTtcbiAgICB9IGVsc2UgaWYgKHRpbWVvdXQgPT09IG51bGwpIHtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG4vKipcbiAqIFtnZXRPZmZzZXQg6I635Y+W6L656Led5bC65a+4XVxuICogQHBhcmFtICB7W3R5cGVdfSBlbCAgIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge1t0eXBlXX0gcGFyYW0gW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIGdldE9mZnNldChlbCwgcGFyYW0pIHtcbiAgdmFyIGwsXG4gICAgcixcbiAgICB0LFxuICAgIGI7XG4gIGlmICghZWwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKCFwYXJhbSkge1xuICAgIHBhcmFtID0ge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICBoOiBudWxsLFxuICAgICAgdzogbnVsbFxuICAgIH07XG4gIH1cblxuICBpZiAoZWwgIT09IHdpbmRvdykge1xuICAgIGVsID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbCA9IGVsLmxlZnQ7XG4gICAgdCA9IGVsLnRvcDtcbiAgICByID0gZWwucmlnaHQ7XG4gICAgYiA9IGVsLmJvdHRvbTtcbiAgfSBlbHNlIHtcbiAgICBsID0gMDtcbiAgICB0ID0gMDtcbiAgICByID0gbCArIGVsLmlubmVyV2lkdGg7XG4gICAgYiA9IHQgKyBlbC5pbm5lckhlaWdodDtcbiAgfVxuICBwYXJhbS5oID0gcGFyYW0uaCB8fCAoKGVsLmhlaWdodCB8fCBlbC5pbm5lckhlaWdodCkgLSBwYXJhbS55KTtcbiAgcGFyYW0udyA9IHBhcmFtLncgfHwgKChlbC53aWR0aCB8fCBlbC5pbm5lcldpZHRoKSAtIHBhcmFtLngpO1xuICBjb25zdCBvZmZzZXQgPSB7XG4gICAgJ2xlZnQnOiBsICsgKGVsLndpZHRoIHx8IGVsLmlubmVyV2lkdGgpIC0gcGFyYW0udyAtIHBhcmFtLngsXG4gICAgJ3RvcCc6IHQgKyAoZWwuaGVpZ2h0IHx8IGVsLmlubmVySGVpZ2h0KSAtIHBhcmFtLmggLSBwYXJhbS55LFxuICAgICdyaWdodCc6IHIgLSBwYXJhbS54LFxuICAgICdib3R0b20nOiBiIC0gcGFyYW0ueVxuICB9O1xuICByZXR1cm4gb2Zmc2V0O1xufVxuXG4vL+WFg+e0oOS9jee9ruavlOi+g1xuZnVuY3Rpb24gY29tcGFyZU9mZnNldChkMSwgZDIpIHtcbiAgY29uc3QgbGVmdCA9IGQyLnJpZ2h0ID4gZDEubGVmdCAmJiBkMi5sZWZ0IDwgZDEucmlnaHQ7XG4gIGNvbnN0IHRvcCA9IGQyLmJvdHRvbSA+IGQxLnRvcCAmJiBkMi50b3AgPCBkMS5ib3R0b207XG4gIHJldHVybiBsZWZ0ICYmIHRvcDtcbn1cbi8v6I635Y+W56e75Yqo5pa55ZCRXG5mdW5jdGlvbiBnZXREaXJlY3Rpb24oYmVmb3JlT2Zmc2V0LCBub3dPZmZzZXQpIHtcbiAgbGV0IGRpcmVjdGlvbiA9ICdub25lJztcbiAgY29uc3QgaG9yaXplbnRhbCA9IGJlZm9yZU9mZnNldC5sZWZ0IC0gbm93T2Zmc2V0LmxlZnQ7XG4gIGNvbnN0IHZlcnRpY2FsID0gYmVmb3JlT2Zmc2V0LnRvcCAtIG5vd09mZnNldC50b3A7XG4gIGlmICh2ZXJ0aWNhbCA9PT0gMCkge1xuICAgIGlmIChob3JpemVudGFsICE9PSAwKSB7XG4gICAgICBkaXJlY3Rpb24gPSBob3JpemVudGFsID4gMCA/ICdsZWZ0JyA6ICdyaWdodCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpcmVjdGlvbiA9ICdub25lJztcbiAgICB9XG4gIH1cbiAgaWYgKGhvcml6ZW50YWwgPT09IDApIHtcbiAgICBpZiAodmVydGljYWwgIT09IDApIHtcbiAgICAgIGRpcmVjdGlvbiA9IHZlcnRpY2FsID4gMCA/ICd1cCcgOiAnZG93bic7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpcmVjdGlvbiA9ICdub25lJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRpcmVjdGlvbjtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKHRhcmdldCwgZWwpIHtcbiAgZm9yIChjb25zdCBrIGluIGVsKSB7XG4gICAgaWYgKGVsLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICB0YXJnZXRba10gPSBlbFtrXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuLyoqXG4gKiBbX19iaW5kRXZlbnQg57uR5a6a5LqL5Lu277yM5YyF5ous5rua5Yqo44CBdG91Y2htb3Zl44CBdHJhbnNmb3Jt44CBcmVzaXpl562JXVxuICogQHJldHVybiB7W3R5cGVdfSAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gX19iaW5kRXZlbnQoKSB7XG4gIGNvbnN0IGhhbmRsZSA9IHRocm90dGxlKCgpID0+IHtcbiAgICBfX2ZpcmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSwgdGhpcy5vcHRpb25zLndhaXQpO1xuICBpZiAodGhpcy5fX2hhbmRsZSkge1xuICAgIC8v6YG/5YWN6YeN5aSN57uR5a6aXG4gICAgdGhpcy52aWV3V3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLl9faGFuZGxlKTtcbiAgICB0aGlzLl9faGFuZGxlID0gbnVsbDtcbiAgfVxuICB0aGlzLl9faGFuZGxlID0gaGFuZGxlO1xuICB0aGlzLnZpZXdXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGhhbmRsZSwgZmFsc2UpO1xuICB0aGlzLnZpZXdXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICBfX2ZpcmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSwgZmFsc2UpO1xuICB0aGlzLnZpZXdXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbkVuZCcsICgpID0+IHtcbiAgICBfX2ZpcmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSwgZmFsc2UpO1xuICAvLyBhbmRyb2lkNC4w5Lul5LiLXG4gIHRoaXMudmlld1dyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0QW5pbWF0aW9uRW5kJywgKCkgPT4ge1xuICAgIF9fZmlyZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9LCBmYWxzZSk7XG4gIHRoaXMudmlld1dyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsICgpID0+IHtcbiAgICBfX2ZpcmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSwgZmFsc2UpO1xufVxuXG4vL+iOt+WPluWuueWZqOWGheaJgOacieeahOWKoOi9veWFg+e0oFxuZnVuY3Rpb24gX19nZXRFbGVtZW50cyhzZWxlY3Rvcikge1xuICAvL+iOt+WPluinhueql+WuueWZqFxuICBjb25zdCB2aWV3V3JhcHBlciA9IHRoaXMub3B0aW9ucy52aWV3V3JhcHBlcjtcbiAgaWYgKHR5cGVvZiB2aWV3V3JhcHBlciA9PT0gJ3N0cmluZycpIHtcbiAgICAvL+WmguaenOaYr+Wtl+espuS4su+8jOWImemAieaLqeWZqFxuICAgIHRoaXMudmlld1dyYXBwZXIgPSBkb2MucXVlcnlTZWxlY3Rvcih2aWV3V3JhcHBlcik7XG4gIH0gZWxzZSB7XG4gICAgLy/lr7nosaHkvKDlgLxcbiAgICB0aGlzLnZpZXdXcmFwcGVyID0gdmlld1dyYXBwZXI7XG4gIH1cbiAgbGV0IGFwcGVhcldhdGNoRWxlbWVudHM7XG4gIC8v6I635Y+W5a655Zmo5YaF55qE5omA5pyJ55uu5qCH5YWD57SgXG4gIGlmICh0aGlzLnZpZXdXcmFwcGVyID09PSB3aW5kb3cpIHtcbiAgICBhcHBlYXJXYXRjaEVsZW1lbnRzID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICB9IGVsc2Uge1xuICAgIGFwcGVhcldhdGNoRWxlbWVudHMgPSB0aGlzLnZpZXdXcmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICB9XG4gIGFwcGVhcldhdGNoRWxlbWVudHMgPSBbXS5zbGljZS5jYWxsKGFwcGVhcldhdGNoRWxlbWVudHMsIG51bGwpO1xuXG4gIGFwcGVhcldhdGNoRWxlbWVudHMgPSBhcHBlYXJXYXRjaEVsZW1lbnRzLmZpbHRlcigoZWxlKSA9PiB7XG4gICAgLy8g5aaC5p6c5bey57uP57uR5a6a6L+H77yM5riF6ZmkYXBwZWFy54q25oCB77yM5LiN5YaN5Yqg5YWl5Yiw5pWw57uE6YeMXG4gICAgaWYgKGVsZS5kYXRhc2V0LmJpbmQgPT09ICcxJykge1xuICAgICAgZGVsZXRlIGVsZS5faGFzQXBwZWFyO1xuICAgICAgZGVsZXRlIGVsZS5faGFzRGlzQXBwZWFyO1xuICAgICAgZGVsZXRlIGVsZS5fYXBwZWFyO1xuICAgICAgZWxlLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5vcHRpb25zLmNscyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGFwcGVhcldhdGNoRWxlbWVudHM7XG59XG5cbmZ1bmN0aW9uIF9faW5pdEJvdW5kaW5nUmVjdChlbGVtZW50cykge1xuICBpZiAoZWxlbWVudHMgJiYgZWxlbWVudHMubGVuZ3RoID4gMCkge1xuICAgIFtdLmZvckVhY2guY2FsbChlbGVtZW50cywgKGVsZSkgPT4ge1xuICAgICAgZWxlLl9lbGVPZmZzZXQgPSBnZXRPZmZzZXQoZWxlKTtcbiAgICAgIC8v56e76Zmk57G75ZCNXG4gICAgICBlbGUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLm9wdGlvbnMuY2xzKTtcbiAgICAgIC8vIOagh+W/l+W3sue7j+e7keWumlxuICAgICAgZWxlLmRhdGFzZXQuYmluZCA9IDE7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8g6Kem5Y+R5Yqg6L29XG5mdW5jdGlvbiBfX2ZpcmUoKSB7XG4gIHZhciB2aWV3V3JhcHBlciA9IHRoaXMudmlld1dyYXBwZXIsXG4gICAgZWxlbWVudHMgPSB0aGlzLmFwcGVhcldhdGNoRWxlbWVudHMsXG4gICAgYXBwZWFyQ2FsbGJhY2sgPSB0aGlzLm9wdGlvbnMub25BcHBlYXIsIC8vYXBwZWFy55qE5omn6KGM5Ye95pWwXG4gICAgZGlzYXBwZWFyQ2FsbGJhY2sgPSB0aGlzLm9wdGlvbnMub25EaXNhcHBlYXIsIC8vZGlzYXBwZWFy55qE5omn6KGM5Ye95pWwXG4gICAgdmlld1dyYXBwZXJPZmZzZXQgPSBnZXRPZmZzZXQodmlld1dyYXBwZXIsIHtcbiAgICAgIHg6IHRoaXMub3B0aW9ucy54LFxuICAgICAgeTogdGhpcy5vcHRpb25zLnksXG4gICAgICBoOiB0aGlzLm9wdGlvbnMuaCxcbiAgICAgIHc6IHRoaXMub3B0aW9ucy53XG4gICAgfSksXG4gICAgaXNPbmNlID0gdGhpcy5vcHRpb25zLm9uY2U7IC8v5piv5ZCm5Y+q5omn6KGM5LiA5qyhXG4gIGlmIChlbGVtZW50cyAmJiBlbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgW10uZm9yRWFjaC5jYWxsKGVsZW1lbnRzLCAoZWxlKSA9PiB7XG4gICAgICAvL+iOt+WPluW3puWPs+i3neemu1xuICAgICAgdmFyIGVsZU9mZnNldCA9IGdldE9mZnNldChlbGUpLFxuICAgICAgICBkaXJlY3Rpb24gPSBnZXREaXJlY3Rpb24oZWxlLl9lbGVPZmZzZXQsIGVsZU9mZnNldCk7XG4gICAgICAvL+S/neWtmOS4iuS4quaXtuauteeahOS9jee9ruS/oeaBr1xuICAgICAgZWxlLl9lbGVPZmZzZXQgPSBlbGVPZmZzZXQ7XG4gICAgICAvL+afpeeci+aYr+WQpuWcqOWPr+inhuWMuuWfn+iMg+WbtOWGhVxuICAgICAgdmFyIGlzSW5WaWV3ID0gY29tcGFyZU9mZnNldCh2aWV3V3JhcHBlck9mZnNldCwgZWxlT2Zmc2V0KSxcbiAgICAgICAgYXBwZWFyID0gZWxlLl9hcHBlYXIsXG4gICAgICAgIF9oYXNBcHBlYXIgPSBlbGUuX2hhc0FwcGVhcixcbiAgICAgICAgX2hhc0Rpc0FwcGVhciA9IGVsZS5faGFzRGlzQXBwZWFyO1xuICAgICAgYXBwZWFyRXZ0LmRhdGEgPSB7XG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgZWxlT2Zmc2V0XG4gICAgICB9O1xuICAgICAgZGlzYXBwZWFyRXZ0LmRhdGEgPSB7XG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgZWxlT2Zmc2V0XG4gICAgICB9O1xuICAgICAgaWYgKGlzSW5WaWV3ICYmICFhcHBlYXIpIHtcbiAgICAgICAgaWYgKChpc09uY2UgJiYgIV9oYXNBcHBlYXIpIHx8ICFpc09uY2UpIHtcbiAgICAgICAgICAvL+WmguaenOWPquinpuWPkeS4gOasoeW5tuS4lOayoeacieinpuWPkei/h+aIluiAheWFgeiuuOinpuWPkeWkmuasoVxuICAgICAgICAgIC8v5aaC5p6c5Zyo5Y+v6KeG5Yy65Z+f5YaF77yM5bm25LiU5piv5LuOZGlzcHBlYXLov5vlhaVhcHBlYXLvvIzliJnmiafooYzlm57osINcbiAgICAgICAgICB2YXIgYXBwZWFyRm4gPSBmdW5jdGlvbihldikge1xuICAgICAgICAgICAgYXBwZWFyQ2FsbGJhY2sgJiYgYXBwZWFyQ2FsbGJhY2suY2FsbChlbGUsIGV2KTtcbiAgICAgICAgICAgIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCdhcHBlYXInLCBhcHBlYXJGbik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcignYXBwZWFyJywgYXBwZWFyRm4pO1xuXG4gICAgICAgICAgLy/op6blj5Hoh6rlrprkuYnkuovku7ZcbiAgICAgICAgICBlbGUuZGlzcGF0Y2hFdmVudChhcHBlYXJFdnQpO1xuICAgICAgICAgIGVsZS5faGFzQXBwZWFyID0gdHJ1ZTtcbiAgICAgICAgICBlbGUuX2FwcGVhciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWlzSW5WaWV3ICYmIGFwcGVhcikge1xuICAgICAgICBpZiAoKGlzT25jZSAmJiAhX2hhc0Rpc0FwcGVhcikgfHwgIWlzT25jZSkge1xuICAgICAgICAgIC8v5aaC5p6c5LiN5Zyo5Y+v6KeG5Yy65Z+f5YaF77yM5bm25LiU5piv5LuOYXBwZWFy6L+b5YWlZGlzYXBwZWFy77yM5omn6KGMZGlzYXBwZWFy5Zue6LCDXG4gICAgICAgICAgdmFyIGRpc2FwcGVhckZuID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgICAgIGRpc2FwcGVhckNhbGxiYWNrICYmIGRpc2FwcGVhckNhbGxiYWNrLmNhbGwoZWxlLCBldik7XG4gICAgICAgICAgICBlbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGlzYXBwZWFyJywgZGlzYXBwZWFyRm4pO1xuICAgICAgICAgIH07XG4gICAgICAgICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoJ2Rpc2FwcGVhcicsIGRpc2FwcGVhckZuKTtcblxuICAgICAgICAgIC8v6Kem5Y+R6Ieq5a6a5LmJ5LqL5Lu2XG4gICAgICAgICAgZWxlLmRpc3BhdGNoRXZlbnQoZGlzYXBwZWFyRXZ0KTtcbiAgICAgICAgICBlbGUuX2hhc0Rpc0FwcGVhciA9IHRydWU7XG4gICAgICAgICAgZWxlLl9hcHBlYXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9faW5pdChvcHRzKSB7XG4gIC8v5omp5bGV5Y+C5pWwXG4gIGV4dGVuZCh0aGlzLm9wdGlvbnMsIG9wdHMgfHwgKG9wdHMgPSB7fSkpO1xuICAvL+iOt+WPluebruagh+WFg+e0oFxuICB0aGlzLmFwcGVhcldhdGNoRWxlbWVudHMgPSB0aGlzLmFwcGVhcldhdGNoRWxlbWVudHMgfHwgX19nZXRFbGVtZW50cy5jYWxsKHRoaXMsIGAuJHt0aGlzLm9wdGlvbnMuY2xzfWApO1xuICAvL+WIneWni+WMluS9jee9ruS/oeaBr1xuICBfX2luaXRCb3VuZGluZ1JlY3QuY2FsbCh0aGlzLCB0aGlzLmFwcGVhcldhdGNoRWxlbWVudHMpO1xuICAvL+e7keWumuS6i+S7tlxuICBfX2JpbmRFdmVudC5jYWxsKHRoaXMpO1xufVxuXG5cbmNsYXNzIEFwcGVhciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8v6buY6K6k5Y+C5pWwXG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgdmlld1dyYXBwZXI6IHdpbmRvdyxcbiAgICAgIHdhaXQ6IDEwMCxcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgdzogbnVsbCxcbiAgICAgIGg6IG51bGwsXG4gICAgICBjbHM6ICdhbWZlLWFwcGVhcicsXG4gICAgICBvbmNlOiBmYWxzZSxcbiAgICAgIG9uQXBwZWFyKCkge30sXG4gICAgICBvbkRpc2FwcGVhcigpIHt9XG4gICAgfTtcbiAgICB0aGlzLnZpZXdXcmFwcGVyID0gbnVsbDtcbiAgICB0aGlzLmFwcGVhcldhdGNoRWxlbWVudHMgPSBudWxsO1xuICAgIF9faW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIGJpbmQobm9kZSkge1xuICAgICAgdmFyIGNscyA9IHRoaXMub3B0aW9ucy5jbHM7XG4gICAgICAvLyDmt7vliqDpnIDopoHnu5HlrprnmoRhcHBlYXLlhYPntKBcbiAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gX19nZXRFbGVtZW50cy5jYWxsKHRoaXMsIG5vZGUpO1xuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoZWxlbWVudHMsIChlbGUpID0+IHtcbiAgICAgICAgICBpZiAoIWVsZS5jbGFzc0xpc3QuY29udGFpbnMoY2xzKSkge1xuICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoY2xzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9IGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEgJiYgKHRoaXMudmlld1dyYXBwZXIgPT09IHdpbmRvdyB8fCB0aGlzLnZpZXdXcmFwcGVyLmNvbnRhaW5zKG5vZGUpKSkge1xuICAgICAgICAvL+WmguaenOS8oOWFpeeahOaYr+WFg+e0oOW5tuS4lOWcqOWMheWQq+WcqOWuueWZqOS4re+8jOebtOaOpea3u+WKoOexu+WQjVxuICAgICAgICBpZiAoIW5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKGNscykpIHtcbiAgICAgICAgICAvL+a3u+WKoOexu+WQjVxuICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChjbHMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIC8v5paw5aKe55qE5a2Q5YWD57SgXG4gICAgICB2YXIgbmV3RWxlbWVudHMgPSBfX2dldEVsZW1lbnRzLmNhbGwodGhpcywgYC4ke3RoaXMub3B0aW9ucy5jbHN9YCk7XG4gICAgICAvL+Wvuee8k+WtmOeahOWtkOWFg+e0oOWBmuWinumHj1xuICAgICAgdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzID0gdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzLmNvbmNhdChuZXdFbGVtZW50cyk7XG4gICAgICAvL+WIneWni+WMluaWsOWtkOWFg+e0oOeahOS9jee9ruS/oeaBr1xuICAgICAgX19pbml0Qm91bmRpbmdSZWN0LmNhbGwodGhpcywgbmV3RWxlbWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8vIOmHjee9ruWHveaVsFxuICByZXNldChvcHRzKSB7XG4gICAgX19pbml0LmNhbGwodGhpcywgb3B0cyk7XG4gICAgdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzLmZvckVhY2goKGVsZSkgPT4ge1xuICAgICAgZGVsZXRlIGVsZS5faGFzQXBwZWFyO1xuICAgICAgZGVsZXRlIGVsZS5faGFzRGlzQXBwZWFyO1xuICAgICAgZGVsZXRlIGVsZS5fYXBwZWFyO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGZpcmUoKSB7XG4gICAgaWYgKCF0aGlzLmFwcGVhcldhdGNoRWxlbWVudHMpIHtcbiAgICAgIHRoaXMuYXBwZWFyV2F0Y2hFbGVtZW50cyA9IFtdO1xuICAgIH1cbiAgICB2YXIgbmV3RWxlbWVudHMgPSBfX2dldEVsZW1lbnRzLmNhbGwodGhpcywgYC4ke3RoaXMub3B0aW9ucy5jbHN9YCk7XG4gICAgdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzID0gdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzLmNvbmNhdChuZXdFbGVtZW50cyk7XG4gICAgLy/liJ3lp4vljJbkvY3nva7kv6Hmga9cbiAgICBfX2luaXRCb3VuZGluZ1JlY3QuY2FsbCh0aGlzLCBuZXdFbGVtZW50cyk7XG4gICAgX19maXJlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuY29uc3QgYXBwZWFyID0ge1xuICBpbnN0YW5jZXM6IFtdLFxuICBpbml0KG9wdHMpIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQXBwZWFyKG9wdHMpO1xuICAgIHRoaXMuaW5zdGFuY2VzLnB1c2goaW5zdGFuY2UpO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSxcbiAgZmlyZUFsbCgpIHtcbiAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXM7XG4gICAgaW5zdGFuY2VzLmZvckVhY2goKGluc3RhbmNlKSA9PiB7XG4gICAgICBpbnN0YW5jZS5maXJlKCk7XG4gICAgfSk7XG4gIH1cbn07XG4vL+azqOWGjOS6i+S7tlxuY3JlYXRlRXZlbnQoKTtcblxuZXhwb3J0IGRlZmF1bHQgYXBwZWFyOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAbW9kdWxlIGFtZmVBcHBlYXJcbiAqL1xuXG4vKipcbiAqIEByZXF1aXJlcyBjbGFzczpBcHBlYXJcbiAqL1xuaW1wb3J0IGFwcGVhciBmcm9tICcuL2FwcGVhcic7XG5cbmNvbnN0IHZlcnNpb24gPSAnMS4wLjAnO1xuLyplc2xpbnQtZGlzYWJsZSBuby1hbGVydCwgbm8tY29uc29sZSAqL1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbmlmICh0eXBlb2YgYWxlcnQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc29sZS5sb2coJ2JhcicpO1xufVxuXG4vKmVzbGludC1lbmFibGUgbm8tYWxlcnQsIG5vLWNvbnNvbGUgKi9cblxuZXhwb3J0IHtcbiAgLyoqXG4gICAqIHZlcnNpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gIHZlcnNpb24sXG4gIC8qKlxuICAgKiBAdHlwZSB7QXBwZWFyfVxuICAgKi9cbiAgYXBwZWFyXG59OyJdfQ==
