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

function createEvent(eventType) {
  appearEvt.initEvent(eventType, false, true);
  disappearEvt.initEvent(eventType, false, true);
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
  isDispatch = this.options.isDispatch,
      // 是否分发事件
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
          if (isDispatch) {
            //触发自定义事件
            ele.dispatchEvent(appearEvt);
          } else {
            appearFn(appearEvt);
          }
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

          if (isDispatch) {
            //触发自定义事件
            ele.dispatchEvent(disappearEvt);
          } else {
            disappearFn(disappearEvt);
          }
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
  //注册事件
  createEvent(this.options.eventType);
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
      isDispatch: true,
      eventType: 'appear', // 事件类型，默认出现事件为appear、消失事件为disappear，自定义事件名，消失事件自动加上前缀dis
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwZWFyLmpzIiwic3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7Ozs7Ozs7QUFFQSxJQUFNLE1BQU0sUUFBTjtBQUNOLElBQU0sWUFBWSxJQUFJLFdBQUosQ0FBZ0IsWUFBaEIsQ0FBWjtBQUNOLElBQU0sZUFBZSxJQUFJLFdBQUosQ0FBZ0IsWUFBaEIsQ0FBZjs7QUFFTixTQUFTLFdBQVQsQ0FBcUIsU0FBckIsRUFBZ0M7QUFDOUIsWUFBVSxTQUFWLENBQW9CLFNBQXBCLEVBQStCLEtBQS9CLEVBQXNDLElBQXRDLEVBRDhCO0FBRTlCLGVBQWEsU0FBYixDQUF1QixTQUF2QixFQUFrQyxLQUFsQyxFQUF5QyxJQUF6QyxFQUY4QjtDQUFoQzs7Ozs7Ozs7QUFXQSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEI7QUFDNUIsTUFBSSxXQUFXLENBQVg7O0FBQ0YsWUFBVSxJQUFWOztBQUNBLGVBRkY7O0FBR0UsaUJBSEY7QUFENEIsTUFLdEIsUUFBUSxTQUFSLEtBQVEsR0FBTTtBQUNsQixlQUFXLEtBQUssR0FBTCxFQUFYLENBRGtCO0FBRWxCLGNBQVUsSUFBVjtBQUZrQixRQUdsQixDQUFLLElBQUwsRUFIa0I7R0FBTixDQUxjO0FBVTVCLFNBQU8sWUFBVztBQUNoQixRQUFJLE1BQU0sS0FBSyxHQUFMLEVBQU47UUFDRixPQUFPLFNBQVA7UUFDQSxZQUFZLFFBQVEsTUFBTSxRQUFOLENBQVIsQ0FIRTtBQUloQixRQUFJLGFBQWEsQ0FBYixJQUFrQixhQUFhLElBQWIsRUFBbUI7O0FBRXZDLG1CQUFhLE9BQWIsRUFGdUM7QUFHdkMsZ0JBQVUsSUFBVixDQUh1QztBQUl2QyxlQUFTLEtBQUssSUFBTCxDQUFULENBSnVDO0tBQXpDLE1BS08sSUFBSSxZQUFZLElBQVosRUFB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Ozs7O0FBRUEsSUFBTSxVQUFVLE9BQVY7Ozs7QUFJTixJQUFJLE9BQU8sS0FBUCxLQUFpQixVQUFqQixJQUErQixRQUFPLHlEQUFQLEtBQW1CLFFBQW5CLEVBQTZCO0FBQzVELFVBQVEsR0FBUixDQUFZLEtBQVosRUFENEQ7Q0FBaEU7Ozs7Ozs7OztBQVdFOzs7OztBQUlBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZG9jID0gZG9jdW1lbnQ7XG5jb25zdCBhcHBlYXJFdnQgPSBkb2MuY3JlYXRlRXZlbnQoXCJIVE1MRXZlbnRzXCIpOyAvL+WIm+W7uuiHquWumuS5ieaYvuekuuS6i+S7tiAgO1xuY29uc3QgZGlzYXBwZWFyRXZ0ID0gZG9jLmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTsgLy/liJvlu7roh6rlrprkuYnmmL7npLrkuovku7YgIDtcblxuZnVuY3Rpb24gY3JlYXRlRXZlbnQoZXZlbnRUeXBlKSB7XG4gIGFwcGVhckV2dC5pbml0RXZlbnQoZXZlbnRUeXBlLCBmYWxzZSwgdHJ1ZSk7XG4gIGRpc2FwcGVhckV2dC5pbml0RXZlbnQoZXZlbnRUeXBlLCBmYWxzZSwgdHJ1ZSk7XG59XG5cbi8qKlxuICogW3Rocm90dGxlIOiKgua1geWHveaVsF1cbiAqIEBwYXJhbSAge1tmdW5jdGlvbl19IGZ1bmMgW+aJp+ihjOWHveaVsF1cbiAqIEBwYXJhbSAge1tpbnRdfSB3YWl0IFvnrYnlvoXml7bplb9dXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0KSB7XG4gIGxldCBwcmV2aW91cyA9IDAsIC8v5LiK5qyh5omn6KGM55qE5pe26Ze0XG4gICAgdGltZW91dCA9IG51bGwsIC8vc2V0VGltb3V05Lu75YqhXG4gICAgYXJncywgLy/lj4LmlbBcbiAgICByZXN1bHQ7IC8v57uT5p6cXG4gIGNvbnN0IGxhdGVyID0gKCkgPT4ge1xuICAgIHByZXZpb3VzID0gRGF0ZS5ub3coKTtcbiAgICB0aW1lb3V0ID0gbnVsbDsgLy/muIXnqbrorqHml7blmahcbiAgICBmdW5jKGFyZ3MpO1xuICB9O1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5vdyA9IERhdGUubm93KCksXG4gICAgICBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgcmVtYWluaW5nID0gd2FpdCAtIChub3cgLSBwcmV2aW91cyk7XG4gICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+PSB3YWl0KSB7XG4gICAgICAvL+WmguaenOayoeacieWJqeS9meaXtumXtO+8jOaIluiAheWtmOWcqOS/ruaUuei/h+ezu+e7n+aXtumXtOWvvOiHtOWJqeS9meaXtumXtOWinuWkp+eahOaDheWGte+8jOWImeaJp+ihjFxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jKGFyZ3MpO1xuICAgIH0gZWxzZSBpZiAodGltZW91dCA9PT0gbnVsbCkge1xuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbi8qKlxuICogW2dldE9mZnNldCDojrflj5bovrnot53lsLrlr7hdXG4gKiBAcGFyYW0gIHtbdHlwZV19IGVsICAgW2Rlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7W3R5cGVdfSBwYXJhbSBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gZ2V0T2Zmc2V0KGVsLCBwYXJhbSkge1xuICB2YXIgbCxcbiAgICByLFxuICAgIHQsXG4gICAgYjtcbiAgaWYgKCFlbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIXBhcmFtKSB7XG4gICAgcGFyYW0gPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIGg6IG51bGwsXG4gICAgICB3OiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIGlmIChlbCAhPT0gd2luZG93KSB7XG4gICAgZWwgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBsID0gZWwubGVmdDtcbiAgICB0ID0gZWwudG9wO1xuICAgIHIgPSBlbC5yaWdodDtcbiAgICBiID0gZWwuYm90dG9tO1xuICB9IGVsc2Uge1xuICAgIGwgPSAwO1xuICAgIHQgPSAwO1xuICAgIHIgPSBsICsgZWwuaW5uZXJXaWR0aDtcbiAgICBiID0gdCArIGVsLmlubmVySGVpZ2h0O1xuICB9XG4gIHBhcmFtLmggPSBwYXJhbS5oIHx8ICgoZWwuaGVpZ2h0IHx8IGVsLmlubmVySGVpZ2h0KSAtIHBhcmFtLnkpO1xuICBwYXJhbS53ID0gcGFyYW0udyB8fCAoKGVsLndpZHRoIHx8IGVsLmlubmVyV2lkdGgpIC0gcGFyYW0ueCk7XG4gIGNvbnN0IG9mZnNldCA9IHtcbiAgICAnbGVmdCc6IGwgKyAoZWwud2lkdGggfHwgZWwuaW5uZXJXaWR0aCkgLSBwYXJhbS53IC0gcGFyYW0ueCxcbiAgICAndG9wJzogdCArIChlbC5oZWlnaHQgfHwgZWwuaW5uZXJIZWlnaHQpIC0gcGFyYW0uaCAtIHBhcmFtLnksXG4gICAgJ3JpZ2h0JzogciAtIHBhcmFtLngsXG4gICAgJ2JvdHRvbSc6IGIgLSBwYXJhbS55XG4gIH07XG4gIHJldHVybiBvZmZzZXQ7XG59XG5cbi8v5YWD57Sg5L2N572u5q+U6L6DXG5mdW5jdGlvbiBjb21wYXJlT2Zmc2V0KGQxLCBkMikge1xuICBjb25zdCBsZWZ0ID0gZDIucmlnaHQgPiBkMS5sZWZ0ICYmIGQyLmxlZnQgPCBkMS5yaWdodDtcbiAgY29uc3QgdG9wID0gZDIuYm90dG9tID4gZDEudG9wICYmIGQyLnRvcCA8IGQxLmJvdHRvbTtcbiAgcmV0dXJuIGxlZnQgJiYgdG9wO1xufVxuLy/ojrflj5bnp7vliqjmlrnlkJFcbmZ1bmN0aW9uIGdldERpcmVjdGlvbihiZWZvcmVPZmZzZXQsIG5vd09mZnNldCkge1xuICBsZXQgZGlyZWN0aW9uID0gJ25vbmUnO1xuICBjb25zdCBob3JpemVudGFsID0gYmVmb3JlT2Zmc2V0LmxlZnQgLSBub3dPZmZzZXQubGVmdDtcbiAgY29uc3QgdmVydGljYWwgPSBiZWZvcmVPZmZzZXQudG9wIC0gbm93T2Zmc2V0LnRvcDtcbiAgaWYgKHZlcnRpY2FsID09PSAwKSB7XG4gICAgaWYgKGhvcml6ZW50YWwgIT09IDApIHtcbiAgICAgIGRpcmVjdGlvbiA9IGhvcml6ZW50YWwgPiAwID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICB9IGVsc2Uge1xuICAgICAgZGlyZWN0aW9uID0gJ25vbmUnO1xuICAgIH1cbiAgfVxuICBpZiAoaG9yaXplbnRhbCA9PT0gMCkge1xuICAgIGlmICh2ZXJ0aWNhbCAhPT0gMCkge1xuICAgICAgZGlyZWN0aW9uID0gdmVydGljYWwgPiAwID8gJ3VwJyA6ICdkb3duJztcbiAgICB9IGVsc2Uge1xuICAgICAgZGlyZWN0aW9uID0gJ25vbmUnO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGlyZWN0aW9uO1xufVxuXG5mdW5jdGlvbiBleHRlbmQodGFyZ2V0LCBlbCkge1xuICBmb3IgKGNvbnN0IGsgaW4gZWwpIHtcbiAgICBpZiAoZWwuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgIHRhcmdldFtrXSA9IGVsW2tdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG4vKipcbiAqIFtfX2JpbmRFdmVudCDnu5Hlrprkuovku7bvvIzljIXmi6zmu5rliqjjgIF0b3VjaG1vdmXjgIF0cmFuc2Zvcm3jgIFyZXNpemXnrYldXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBfX2JpbmRFdmVudCgpIHtcbiAgY29uc3QgaGFuZGxlID0gdGhyb3R0bGUoKCkgPT4ge1xuICAgIF9fZmlyZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9LCB0aGlzLm9wdGlvbnMud2FpdCk7XG4gIGlmICh0aGlzLl9faGFuZGxlKSB7XG4gICAgLy/pgb/lhY3ph43lpI3nu5HlrppcbiAgICB0aGlzLnZpZXdXcmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuX19oYW5kbGUpO1xuICAgIHRoaXMuX19oYW5kbGUgPSBudWxsO1xuICB9XG4gIHRoaXMuX19oYW5kbGUgPSBoYW5kbGU7XG4gIHRoaXMudmlld1dyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaGFuZGxlLCBmYWxzZSk7XG4gIHRoaXMudmlld1dyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgIF9fZmlyZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9LCBmYWxzZSk7XG4gIHRoaXMudmlld1dyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignYW5pbWF0aW9uRW5kJywgKCkgPT4ge1xuICAgIF9fZmlyZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9LCBmYWxzZSk7XG4gIC8vIGFuZHJvaWQ0LjDku6XkuItcbiAgdGhpcy52aWV3V3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRBbmltYXRpb25FbmQnLCAoKSA9PiB7XG4gICAgX19maXJlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0sIGZhbHNlKTtcbiAgdGhpcy52aWV3V3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgKCkgPT4ge1xuICAgIF9fZmlyZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9LCBmYWxzZSk7XG59XG5cbi8v6I635Y+W5a655Zmo5YaF5omA5pyJ55qE5Yqg6L295YWD57SgXG5mdW5jdGlvbiBfX2dldEVsZW1lbnRzKHNlbGVjdG9yKSB7XG4gIC8v6I635Y+W6KeG56qX5a655ZmoXG4gIGNvbnN0IHZpZXdXcmFwcGVyID0gdGhpcy5vcHRpb25zLnZpZXdXcmFwcGVyO1xuICBpZiAodHlwZW9mIHZpZXdXcmFwcGVyID09PSAnc3RyaW5nJykge1xuICAgIC8v5aaC5p6c5piv5a2X56ym5Liy77yM5YiZ6YCJ5oup5ZmoXG4gICAgdGhpcy52aWV3V3JhcHBlciA9IGRvYy5xdWVyeVNlbGVjdG9yKHZpZXdXcmFwcGVyKTtcbiAgfSBlbHNlIHtcbiAgICAvL+WvueixoeS8oOWAvFxuICAgIHRoaXMudmlld1dyYXBwZXIgPSB2aWV3V3JhcHBlcjtcbiAgfVxuICBsZXQgYXBwZWFyV2F0Y2hFbGVtZW50cztcbiAgLy/ojrflj5blrrnlmajlhoXnmoTmiYDmnInnm67moIflhYPntKBcbiAgaWYgKHRoaXMudmlld1dyYXBwZXIgPT09IHdpbmRvdykge1xuICAgIGFwcGVhcldhdGNoRWxlbWVudHMgPSBkb2MucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH0gZWxzZSB7XG4gICAgYXBwZWFyV2F0Y2hFbGVtZW50cyA9IHRoaXMudmlld1dyYXBwZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH1cbiAgYXBwZWFyV2F0Y2hFbGVtZW50cyA9IFtdLnNsaWNlLmNhbGwoYXBwZWFyV2F0Y2hFbGVtZW50cywgbnVsbCk7XG5cbiAgYXBwZWFyV2F0Y2hFbGVtZW50cyA9IGFwcGVhcldhdGNoRWxlbWVudHMuZmlsdGVyKChlbGUpID0+IHtcbiAgICAvLyDlpoLmnpzlt7Lnu4/nu5Hlrprov4fvvIzmuIXpmaRhcHBlYXLnirbmgIHvvIzkuI3lho3liqDlhaXliLDmlbDnu4Tph4xcbiAgICBpZiAoZWxlLmRhdGFzZXQuYmluZCA9PT0gJzEnKSB7XG4gICAgICBkZWxldGUgZWxlLl9oYXNBcHBlYXI7XG4gICAgICBkZWxldGUgZWxlLl9oYXNEaXNBcHBlYXI7XG4gICAgICBkZWxldGUgZWxlLl9hcHBlYXI7XG4gICAgICBlbGUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLm9wdGlvbnMuY2xzKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gYXBwZWFyV2F0Y2hFbGVtZW50cztcbn1cblxuZnVuY3Rpb24gX19pbml0Qm91bmRpbmdSZWN0KGVsZW1lbnRzKSB7XG4gIGlmIChlbGVtZW50cyAmJiBlbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgW10uZm9yRWFjaC5jYWxsKGVsZW1lbnRzLCAoZWxlKSA9PiB7XG4gICAgICBlbGUuX2VsZU9mZnNldCA9IGdldE9mZnNldChlbGUpO1xuICAgICAgLy/np7vpmaTnsbvlkI1cbiAgICAgIGVsZS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMub3B0aW9ucy5jbHMpO1xuICAgICAgLy8g5qCH5b+X5bey57uP57uR5a6aXG4gICAgICBlbGUuZGF0YXNldC5iaW5kID0gMTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyDop6blj5HliqDovb1cbmZ1bmN0aW9uIF9fZmlyZSgpIHtcbiAgdmFyIHZpZXdXcmFwcGVyID0gdGhpcy52aWV3V3JhcHBlcixcbiAgICBlbGVtZW50cyA9IHRoaXMuYXBwZWFyV2F0Y2hFbGVtZW50cyxcbiAgICBhcHBlYXJDYWxsYmFjayA9IHRoaXMub3B0aW9ucy5vbkFwcGVhciwgLy9hcHBlYXLnmoTmiafooYzlh73mlbBcbiAgICBpc0Rpc3BhdGNoID0gdGhpcy5vcHRpb25zLmlzRGlzcGF0Y2gsLy8g5piv5ZCm5YiG5Y+R5LqL5Lu2XG4gICAgZGlzYXBwZWFyQ2FsbGJhY2sgPSB0aGlzLm9wdGlvbnMub25EaXNhcHBlYXIsIC8vZGlzYXBwZWFy55qE5omn6KGM5Ye95pWwXG4gICAgdmlld1dyYXBwZXJPZmZzZXQgPSBnZXRPZmZzZXQodmlld1dyYXBwZXIsIHtcbiAgICAgIHg6IHRoaXMub3B0aW9ucy54LFxuICAgICAgeTogdGhpcy5vcHRpb25zLnksXG4gICAgICBoOiB0aGlzLm9wdGlvbnMuaCxcbiAgICAgIHc6IHRoaXMub3B0aW9ucy53XG4gICAgfSksXG4gICAgaXNPbmNlID0gdGhpcy5vcHRpb25zLm9uY2U7IC8v5piv5ZCm5Y+q5omn6KGM5LiA5qyhXG4gIGlmIChlbGVtZW50cyAmJiBlbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgW10uZm9yRWFjaC5jYWxsKGVsZW1lbnRzLCAoZWxlKSA9PiB7XG4gICAgICAvL+iOt+WPluW3puWPs+i3neemu1xuICAgICAgdmFyIGVsZU9mZnNldCA9IGdldE9mZnNldChlbGUpLFxuICAgICAgICBkaXJlY3Rpb24gPSBnZXREaXJlY3Rpb24oZWxlLl9lbGVPZmZzZXQsIGVsZU9mZnNldCk7XG4gICAgICAvL+S/neWtmOS4iuS4quaXtuauteeahOS9jee9ruS/oeaBr1xuICAgICAgZWxlLl9lbGVPZmZzZXQgPSBlbGVPZmZzZXQ7XG4gICAgICAvL+afpeeci+aYr+WQpuWcqOWPr+inhuWMuuWfn+iMg+WbtOWGhVxuICAgICAgdmFyIGlzSW5WaWV3ID0gY29tcGFyZU9mZnNldCh2aWV3V3JhcHBlck9mZnNldCwgZWxlT2Zmc2V0KSxcbiAgICAgICAgYXBwZWFyID0gZWxlLl9hcHBlYXIsXG4gICAgICAgIF9oYXNBcHBlYXIgPSBlbGUuX2hhc0FwcGVhcixcbiAgICAgICAgX2hhc0Rpc0FwcGVhciA9IGVsZS5faGFzRGlzQXBwZWFyO1xuICAgICAgYXBwZWFyRXZ0LmRhdGEgPSB7XG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgZWxlT2Zmc2V0XG4gICAgICB9O1xuICAgICAgZGlzYXBwZWFyRXZ0LmRhdGEgPSB7XG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgZWxlT2Zmc2V0XG4gICAgICB9O1xuICAgICAgaWYgKGlzSW5WaWV3ICYmICFhcHBlYXIpIHtcbiAgICAgICAgaWYgKChpc09uY2UgJiYgIV9oYXNBcHBlYXIpIHx8ICFpc09uY2UpIHtcbiAgICAgICAgICAvL+WmguaenOWPquinpuWPkeS4gOasoeW5tuS4lOayoeacieinpuWPkei/h+aIluiAheWFgeiuuOinpuWPkeWkmuasoVxuICAgICAgICAgIC8v5aaC5p6c5Zyo5Y+v6KeG5Yy65Z+f5YaF77yM5bm25LiU5piv5LuOZGlzcHBlYXLov5vlhaVhcHBlYXLvvIzliJnmiafooYzlm57osINcbiAgICAgICAgICB2YXIgYXBwZWFyRm4gPSBmdW5jdGlvbihldikge1xuICAgICAgICAgICAgYXBwZWFyQ2FsbGJhY2sgJiYgYXBwZWFyQ2FsbGJhY2suY2FsbChlbGUsIGV2KTtcbiAgICAgICAgICAgIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCdhcHBlYXInLCBhcHBlYXJGbik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcignYXBwZWFyJywgYXBwZWFyRm4pO1xuICAgICAgICAgIGlmIChpc0Rpc3BhdGNoKSB7XG4gICAgICAgICAgICAvL+inpuWPkeiHquWumuS5ieS6i+S7tlxuICAgICAgICAgICAgZWxlLmRpc3BhdGNoRXZlbnQoYXBwZWFyRXZ0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwZWFyRm4oYXBwZWFyRXZ0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxlLl9oYXNBcHBlYXIgPSB0cnVlO1xuICAgICAgICAgIGVsZS5fYXBwZWFyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghaXNJblZpZXcgJiYgYXBwZWFyKSB7XG4gICAgICAgIGlmICgoaXNPbmNlICYmICFfaGFzRGlzQXBwZWFyKSB8fCAhaXNPbmNlKSB7XG4gICAgICAgICAgLy/lpoLmnpzkuI3lnKjlj6/op4bljLrln5/lhoXvvIzlubbkuJTmmK/ku45hcHBlYXLov5vlhaVkaXNhcHBlYXLvvIzmiafooYxkaXNhcHBlYXLlm57osINcbiAgICAgICAgICB2YXIgZGlzYXBwZWFyRm4gPSBmdW5jdGlvbihldikge1xuICAgICAgICAgICAgZGlzYXBwZWFyQ2FsbGJhY2sgJiYgZGlzYXBwZWFyQ2FsbGJhY2suY2FsbChlbGUsIGV2KTtcbiAgICAgICAgICAgIGVsZS5yZW1vdmVFdmVudExpc3RlbmVyKCdkaXNhcHBlYXInLCBkaXNhcHBlYXJGbik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcignZGlzYXBwZWFyJywgZGlzYXBwZWFyRm4pO1xuXG4gICAgICAgICAgaWYgKGlzRGlzcGF0Y2gpIHtcbiAgICAgICAgICAgIC8v6Kem5Y+R6Ieq5a6a5LmJ5LqL5Lu2XG4gICAgICAgICAgICBlbGUuZGlzcGF0Y2hFdmVudChkaXNhcHBlYXJFdnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXNhcHBlYXJGbihkaXNhcHBlYXJFdnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbGUuX2hhc0Rpc0FwcGVhciA9IHRydWU7XG4gICAgICAgICAgZWxlLl9hcHBlYXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9faW5pdChvcHRzKSB7XG4gIC8v5omp5bGV5Y+C5pWwXG4gIGV4dGVuZCh0aGlzLm9wdGlvbnMsIG9wdHMgfHwgKG9wdHMgPSB7fSkpO1xuICAvL+azqOWGjOS6i+S7tlxuICBjcmVhdGVFdmVudCh0aGlzLm9wdGlvbnMuZXZlbnRUeXBlKTtcbiAgLy/ojrflj5bnm67moIflhYPntKBcbiAgdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzID0gdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzIHx8IF9fZ2V0RWxlbWVudHMuY2FsbCh0aGlzLCBgLiR7dGhpcy5vcHRpb25zLmNsc31gKTtcbiAgLy/liJ3lp4vljJbkvY3nva7kv6Hmga9cbiAgX19pbml0Qm91bmRpbmdSZWN0LmNhbGwodGhpcywgdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzKTtcbiAgLy/nu5Hlrprkuovku7ZcbiAgX19iaW5kRXZlbnQuY2FsbCh0aGlzKTtcbn1cblxuXG5jbGFzcyBBcHBlYXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvL+m7mOiupOWPguaVsFxuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIHZpZXdXcmFwcGVyOiB3aW5kb3csXG4gICAgICB3YWl0OiAxMDAsXG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIHc6IG51bGwsXG4gICAgICBoOiBudWxsLFxuICAgICAgY2xzOiAnYW1mZS1hcHBlYXInLFxuICAgICAgb25jZTogZmFsc2UsXG4gICAgICBpc0Rpc3BhdGNoOiB0cnVlLFxuICAgICAgZXZlbnRUeXBlOiAnYXBwZWFyJywvLyDkuovku7bnsbvlnovvvIzpu5jorqTlh7rnjrDkuovku7bkuLphcHBlYXLjgIHmtojlpLHkuovku7bkuLpkaXNhcHBlYXLvvIzoh6rlrprkuYnkuovku7blkI3vvIzmtojlpLHkuovku7boh6rliqjliqDkuIrliY3nvIBkaXNcbiAgICAgIG9uQXBwZWFyKCkge30sXG4gICAgICBvbkRpc2FwcGVhcigpIHt9XG4gICAgfTtcbiAgICB0aGlzLnZpZXdXcmFwcGVyID0gbnVsbDtcbiAgICB0aGlzLmFwcGVhcldhdGNoRWxlbWVudHMgPSBudWxsO1xuICAgIF9faW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIGJpbmQobm9kZSkge1xuICAgICAgdmFyIGNscyA9IHRoaXMub3B0aW9ucy5jbHM7XG4gICAgICAvLyDmt7vliqDpnIDopoHnu5HlrprnmoRhcHBlYXLlhYPntKBcbiAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gX19nZXRFbGVtZW50cy5jYWxsKHRoaXMsIG5vZGUpO1xuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoZWxlbWVudHMsIChlbGUpID0+IHtcbiAgICAgICAgICBpZiAoIWVsZS5jbGFzc0xpc3QuY29udGFpbnMoY2xzKSkge1xuICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoY2xzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9IGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEgJiYgKHRoaXMudmlld1dyYXBwZXIgPT09IHdpbmRvdyB8fCB0aGlzLnZpZXdXcmFwcGVyLmNvbnRhaW5zKG5vZGUpKSkge1xuICAgICAgICAvL+WmguaenOS8oOWFpeeahOaYr+WFg+e0oOW5tuS4lOWcqOWMheWQq+WcqOWuueWZqOS4re+8jOebtOaOpea3u+WKoOexu+WQjVxuICAgICAgICBpZiAoIW5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKGNscykpIHtcbiAgICAgICAgICAvL+a3u+WKoOexu+WQjVxuICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChjbHMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIC8v5paw5aKe55qE5a2Q5YWD57SgXG4gICAgICB2YXIgbmV3RWxlbWVudHMgPSBfX2dldEVsZW1lbnRzLmNhbGwodGhpcywgYC4ke3RoaXMub3B0aW9ucy5jbHN9YCk7XG4gICAgICAvL+Wvuee8k+WtmOeahOWtkOWFg+e0oOWBmuWinumHj1xuICAgICAgdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzID0gdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzLmNvbmNhdChuZXdFbGVtZW50cyk7XG4gICAgICAvL+WIneWni+WMluaWsOWtkOWFg+e0oOeahOS9jee9ruS/oeaBr1xuICAgICAgX19pbml0Qm91bmRpbmdSZWN0LmNhbGwodGhpcywgbmV3RWxlbWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8vIOmHjee9ruWHveaVsFxuICByZXNldChvcHRzKSB7XG4gICAgX19pbml0LmNhbGwodGhpcywgb3B0cyk7XG4gICAgdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzLmZvckVhY2goKGVsZSkgPT4ge1xuICAgICAgZGVsZXRlIGVsZS5faGFzQXBwZWFyO1xuICAgICAgZGVsZXRlIGVsZS5faGFzRGlzQXBwZWFyO1xuICAgICAgZGVsZXRlIGVsZS5fYXBwZWFyO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGZpcmUoKSB7XG4gICAgaWYgKCF0aGlzLmFwcGVhcldhdGNoRWxlbWVudHMpIHtcbiAgICAgIHRoaXMuYXBwZWFyV2F0Y2hFbGVtZW50cyA9IFtdO1xuICAgIH1cbiAgICB2YXIgbmV3RWxlbWVudHMgPSBfX2dldEVsZW1lbnRzLmNhbGwodGhpcywgYC4ke3RoaXMub3B0aW9ucy5jbHN9YCk7XG4gICAgdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzID0gdGhpcy5hcHBlYXJXYXRjaEVsZW1lbnRzLmNvbmNhdChuZXdFbGVtZW50cyk7XG4gICAgLy/liJ3lp4vljJbkvY3nva7kv6Hmga9cbiAgICBfX2luaXRCb3VuZGluZ1JlY3QuY2FsbCh0aGlzLCBuZXdFbGVtZW50cyk7XG4gICAgX19maXJlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuY29uc3QgYXBwZWFyID0ge1xuICBpbnN0YW5jZXM6IFtdLFxuICBpbml0KG9wdHMpIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQXBwZWFyKG9wdHMpO1xuICAgIHRoaXMuaW5zdGFuY2VzLnB1c2goaW5zdGFuY2UpO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSxcbiAgZmlyZUFsbCgpIHtcbiAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXM7XG4gICAgaW5zdGFuY2VzLmZvckVhY2goKGluc3RhbmNlKSA9PiB7XG4gICAgICBpbnN0YW5jZS5maXJlKCk7XG4gICAgfSk7XG4gIH1cbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgYXBwZWFyOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAbW9kdWxlIGFtZmVBcHBlYXJcbiAqL1xuXG4vKipcbiAqIEByZXF1aXJlcyBjbGFzczpBcHBlYXJcbiAqL1xuaW1wb3J0IGFwcGVhciBmcm9tICcuL2FwcGVhcic7XG5cbmNvbnN0IHZlcnNpb24gPSAnMS4wLjAnO1xuLyplc2xpbnQtZGlzYWJsZSBuby1hbGVydCwgbm8tY29uc29sZSAqL1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbmlmICh0eXBlb2YgYWxlcnQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc29sZS5sb2coJ2JhcicpO1xufVxuXG4vKmVzbGludC1lbmFibGUgbm8tYWxlcnQsIG5vLWNvbnNvbGUgKi9cblxuZXhwb3J0IHtcbiAgLyoqXG4gICAqIHZlcnNpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gIHZlcnNpb24sXG4gIC8qKlxuICAgKiBAdHlwZSB7QXBwZWFyfVxuICAgKi9cbiAgYXBwZWFyXG59OyJdfQ==
