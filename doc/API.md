# The API

```javascript
import AmfeAppear from 'amfe-appear';
```

## initializate

### AmfeAppear.appear.init(options);

create an appear instance

```jsdoc
@param {Object} options - options of initializaion
```

## Options

初始化时，应该传入一个options对象，如```let instance = AmfeAppear.appear.init(options)```.

如果需要重置参数，则应该```instance.reset(options)```.

### viewWrapper
- Type: `String | HTMLElement`
- Default: window

视窗元素

### cls
- Type: `String`
- Default: 'amfe-appear'

绑定的元素类名

### once
- Type: `Boolean`
- Default: false

是否只触发一次appear、disappear事件

### onAppear
- Type: `Function`
- Default: function() {}

触发appear事件时的回调

### onDisappear
- Type: `Function`
- Default: function() {}

触发disappear事件时的回调

### x
- Type: `Number`
- Default: 0

可视区域距离视窗左边距离，元素出现在大于视窗左边x + ```'px'```的元素触发appear事件

### y
- Type: `Number`
- Default: 0

可视区域距离视窗底部距离，元素出现在大于视窗底部y + ```'px'```的元素触发appear事件

### h
- Type: `Number`
- Default: （视窗高度）

可视区域高度，出现在大于视窗底部y + ```'px'```，小于(y + h) + ```'px'```的元素触发appear事件

### w
- Type: `Number`
- Default: （视窗宽度）

可视区域宽度，出现在大于视窗左边x + ```'px'```，小于(x + w) + ````'px'```的元素触发appear事件

### wait
- Type: `Number`
- Default: 100

触发节流回调函数的时间，优化性能使用

## GUIDE PIC

![](http://gw.alicdn.com/mt/TB1kEc5MpXXXXblXVXXXXXXXXXX-360-600.png)


## Methods

### init(options)

create an appear instance

```javascript
AmfeAppear.appear.init(options);
```

return appear instance

### fireAll

fire all appear instance

```javascript
AmfeAppear.appear.fireAll();
```

## Instance Methods

### fire()

fire appear check

```javascript
instance.fire();
```

### bind(node)

add bind element

```jsdoc
@return {String | HTMLElement} node - css3 selector or html element
```

```javascript
instance.bind('.item');
```

or

```javascript
let node = document.querySelector('.item');
instance.bind(node);
```



### reset(options)

reset the config of instance

return an appear instance

```jsdoc
@return {Object} options - options of initializaion
```

```javascript
instance.reset(options);
```

## Events

### appear

This event fires when element appear in viewWrapper ```from disappear```;

```html
<div class="amfe-appear item"></div>
```

```javascript
let node = document.querySelector('.item');
node.addEventListener('appear', function(ev) {
    console.log(ev);
    });
```

### disappear

This event fires when element disappear in viewWrapper ```from appear```;

```html
<div class="amfe-appear item"></div>
```

```javascript
let node = document.querySelector('.item');
node.addEventListener('disappear', function(ev) {
    console.log(ev);
    });
```


