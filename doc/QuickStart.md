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
        wait: 100,
        onAppear() {},
        onDisappear() {}
    });
instance.fire();
```


