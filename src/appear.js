'use strict';

const doc = document;
const appearEvt = doc.createEvent("HTMLEvents"); //创建自定义显示事件  ;
const disappearEvt = doc.createEvent("HTMLEvents"); //创建自定义显示事件  ;

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
  let previous = 0, //上次执行的时间
    timeout = null, //setTimout任务
    args, //参数
    result; //结果
  const later = () => {
    previous = Date.now();
    timeout = null; //清空计时器
    func(args);
  };
  return function() {
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
  var l,
    r,
    t,
    b;
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
  param.h = param.h || ((el.height || el.innerHeight) - param.y);
  param.w = param.w || ((el.width || el.innerWidth) - param.x);
  const offset = {
    'left': l + (el.width || el.innerWidth) - param.w - param.x,
    'top': t + (el.height || el.innerHeight) - param.h - param.y,
    'right': r - param.x,
    'bottom': b - param.y
  };
  return offset;
}

//元素位置比较
function compareOffset(d1, d2) {
  const left = d2.right > d1.left && d2.left < d1.right;
  const top = d2.bottom > d1.top && d2.top < d1.bottom;
  return left && top;
}
//获取移动方向
function getDirection(beforeOffset, nowOffset) {
  let direction = 'none';
  const horizental = beforeOffset.left - nowOffset.left;
  const vertical = beforeOffset.top - nowOffset.top;
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
  for (const k in el) {
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
  const handle = throttle(() => {
    __fire.apply(this, arguments);
  }, this.options.wait);
  if (this.__handle) {
    //避免重复绑定
    this.viewWrapper.removeEventListener('scroll', this.__handle);
    this.__handle = null;
  }
  this.__handle = handle;
  this.viewWrapper.addEventListener('scroll', handle, false);
  this.viewWrapper.addEventListener('resize', () => {
    __fire.apply(this, arguments);
  }, false);
  this.viewWrapper.addEventListener('animationEnd', () => {
    __fire.apply(this, arguments);
  }, false);
  // android4.0以下
  this.viewWrapper.addEventListener('webkitAnimationEnd', () => {
    __fire.apply(this, arguments);
  }, false);
  this.viewWrapper.addEventListener('transitionend', () => {
    __fire.apply(this, arguments);
  }, false);
}

//获取容器内所有的加载元素
function __getElements(selector) {
  //获取视窗容器
  const viewWrapper = this.options.viewWrapper;
  if (typeof viewWrapper === 'string') {
    //如果是字符串，则选择器
    this.viewWrapper = doc.querySelector(viewWrapper);
  } else {
    //对象传值
    this.viewWrapper = viewWrapper;
  }
  let appearWatchElements;
  //获取容器内的所有目标元素
  if (this.viewWrapper === window) {
    appearWatchElements = doc.querySelectorAll(selector);
  } else {
    appearWatchElements = this.viewWrapper.querySelectorAll(selector);
  }
  appearWatchElements = [].slice.call(appearWatchElements, null);

  appearWatchElements = appearWatchElements.filter((ele) => {
    // 如果已经绑定过，清除appear状态，不再加入到数组里
    if (ele.dataset.bind === '1') {
      delete ele._hasAppear;
      delete ele._hasDisAppear;
      delete ele._appear;
      ele.classList.remove(this.options.cls);
      return false;
    } else {
      return true;
    }
  });

  return appearWatchElements;
}

function __initBoundingRect(elements) {
  if (elements && elements.length > 0) {
    [].forEach.call(elements, (ele) => {
      ele._eleOffset = getOffset(ele);
      //移除类名
      ele.classList.remove(this.options.cls);
      // 标志已经绑定
      ele.dataset.bind = 1;
    });
  }
}

// 触发加载
function __fire() {
  var viewWrapper = this.viewWrapper,
    elements = this.appearWatchElements,
    appearCallback = this.options.onAppear, //appear的执行函数
    disappearCallback = this.options.onDisappear, //disappear的执行函数
    viewWrapperOffset = getOffset(viewWrapper, {
      x: this.options.x,
      y: this.options.y,
      h: this.options.h,
      w: this.options.w
    }),
    isOnce = this.options.once; //是否只执行一次
  if (elements && elements.length > 0) {
    [].forEach.call(elements, (ele) => {
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
        direction,
        eleOffset
      };
      disappearEvt.data = {
        direction,
        eleOffset
      };
      if (isInView && !appear) {
        if ((isOnce && !_hasAppear) || !isOnce) {
          //如果只触发一次并且没有触发过或者允许触发多次
          //如果在可视区域内，并且是从disppear进入appear，则执行回调
          var appearFn = function(ev) {
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
        if ((isOnce && !_hasDisAppear) || !isOnce) {
          //如果不在可视区域内，并且是从appear进入disappear，执行disappear回调
          var disappearFn = function(ev) {
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
  this.appearWatchElements = this.appearWatchElements || __getElements.call(this, `.${this.options.cls}`);
  //初始化位置信息
  __initBoundingRect.call(this, this.appearWatchElements);
  //绑定事件
  __bindEvent.call(this);
}


class Appear {
  constructor() {
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
      onAppear() {},
      onDisappear() {}
    };
    this.viewWrapper = null;
    this.appearWatchElements = null;
    __init.apply(this, arguments);
  }
  bind(node) {
      var cls = this.options.cls;
      // 添加需要绑定的appear元素
      if (typeof node === 'string') {
        var elements = __getElements.call(this, node);
        [].forEach.call(elements, (ele) => {
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
      var newElements = __getElements.call(this, `.${this.options.cls}`);
      //对缓存的子元素做增量
      this.appearWatchElements = this.appearWatchElements.concat(newElements);
      //初始化新子元素的位置信息
      __initBoundingRect.call(this, newElements);
      return this;
    }
    // 重置函数
  reset(opts) {
    __init.call(this, opts);
    this.appearWatchElements.forEach((ele) => {
      delete ele._hasAppear;
      delete ele._hasDisAppear;
      delete ele._appear;
    });
    return this;
  }
  fire() {
    if (!this.appearWatchElements) {
      this.appearWatchElements = [];
    }
    var newElements = __getElements.call(this, `.${this.options.cls}`);
    this.appearWatchElements = this.appearWatchElements.concat(newElements);
    //初始化位置信息
    __initBoundingRect.call(this, newElements);
    __fire.call(this);
    return this;
  }
}

const appear = {
  instances: [],
  init(opts) {
    var instance = new Appear(opts);
    this.instances.push(instance);
    return instance;
  },
  fireAll() {
    var instances = this.instances;
    instances.forEach((instance) => {
      instance.fire();
    });
  }
};
//注册事件
createEvent();

export default appear;