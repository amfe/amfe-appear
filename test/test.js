var AmfeAppear = require('amfe-appear');

describe('appear.js', function() {
  var items = document.querySelectorAll('.list-item');
  
  var instance = AmfeAppear.appear.init({
    viewWrapper: window,
    wait: 100,
    x: 0,
    y: 0,
    w: null,
    h: null,
    cls: 'amfe-appear',
    once: false,
    onAppear: function() {},
    onDisappear: function() {}
  });
  instance.fire();
  it('instance has three methods', function() {

    expect(instance).itself.to.respondTo('fire', 'bind', 'reset');

  });

  it('fire appear and disappear event', function() {
    [].forEach.call(items, function(item) {
      item.addEventListener('appear', function(ev) {
        expect(ev.type).to.equal('appear');
      });
      item.addEventListener('disappear', function(ev) {
        expect(ev.type).to.equal('disappear');
      });
    });
    window.scrollTo(0, 10000);
    window.scrollTo(0, 0);
  });
  it('bind new element', function() {
    var ele = document.querySelector('#J_new-item');
    instance.bind(ele);
    instance.fire();
    ele.addEventListener('appear', function(ev) {
      expect(ev.type).to.equal('appear');
    });
    ele.addEventListener('disappear', function(ev) {
      expect(ev.type).to.equal('disappear');
    });
    window.scrollTo(0, 10000);
    window.scrollTo(0, 0);
  });
  it('reset config', function() {
    instance.reset({
      viewWrapper: window,
      wait: 100,
      x: 100,
      y: 100,
      w: 100,
      h: 100,
      cls: 'amfe-appear',
      once: false,
      onAppear: function(ev) {
        expect(ev.type).to.equal('appear');
      },
      onDisappear: function(ev) {
        expect(ev.type).to.equal('disappear');
      }
    });
    instance.fire();
    window.scrollTo(0, 10000);
    window.scrollTo(0, 0);
  });
});