# Getting Started

## Install

```shell
tnpm install amfe-appear --save
```

## Usage

```javascript
import AmfeAppear from 'amfe-appear'
```

## Samples

Initializing:

```html
<div class="wrapper">
    <ul>
        <li class="amfe-appear item"></li>
        <li class="amfe-appear item"></li>
        <li class="amfe-appear item"></li>
        <li class="amfe-appear item"></li>
    </ul>
</div>
```

```javascript
let instance = AmfeAppear.appear.init({
        viewWrapper: window,
        cls: 'amfe-appear',
        x: 0,
        y: 0,
        w: null,
        h: null,
        once: false,
        isDispatch: true,
        eventType: 'appear',// 事件类型，默认出现事件为appear、消失事件为disappear，自定义事件名，消失事件自动加上前缀dis
        wait: 100,
        onAppear() {},
        onDisappear() {}
    });
instance.fire();
```


