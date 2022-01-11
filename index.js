(function() {

  class BaseEvent {
    constructor(ele) {
      this.element = ele;
      this._events = {};
      ele.bindEvent = this.bindEvent.bind(this);
      ele.getAllEventListeners = this.getAllEventListeners.bind(this);
      ele.getAllEvents = this.getAllEvents.bind(this)
    }
    bindEvent(eventName, callback) {
      if(this._events[eventName]) {
        this._events[eventName].push(callback);
      } else {
        this._events[eventName] = [callback];
      }
      this.element.addEventListener(eventName, callback);
    }
    getAllEvents() {
      return Object.getOwnPropertyNames(this._events);
    }
    getAllEventListeners() {
      return this._events;
    }
  }

  function extendElement(ele) {
    ele._extends = new BaseEvent(ele);
    return ele;
  }

  function extendElement(ele) {
    if(!ele) {
      return null;
    }
    if(!ele._extends) {
      ele._extends = new BaseEvent(ele);
      return ele;
    }
  }

  const createEle = document.createElement;
  document.createElement = function() {
    const newElem = createEle.call(document, arguments[0], arguments[1])
    extendElement(newElem);
    return newElem;
  }

  const getElementById = document.getElementById;
  document.getElementById = function() {
  const elem = getElementById.call(document, arguments[0]);
    return extendElement(elem);
  }

  const getElementsByClassName = document.getElementsByClassName;
  document.getElementsByClassName = function() {
    const elem = getElementsByClassName.call(document, arguments[0]);
    if(!elem) {
      return new HTMLAllCollection();
    }
    return proxyObject(elem);
  }

  function proxyObject(obj) {
    const hanlder = {
      get: function(obj, prop) {
        return extendElement(obj[prop]);
      }
    }

    const proxyObject = new Proxy(obj, hanlder);
    return proxyObject
  }

  const getElementsByName = document.getElementsByName;
  document.getElementsByName = function() {
    const elem = getElementsByName.call(document, arguments[0]);
    if(!elem) {
      return new NodeList();
    }
    return proxyObject(elem);
  }

  const getElementsByTagName = document.getElementsByTagName;
  document.getElementsByTagName = function() {
    const elem = getElementsByTagName.call(document, arguments[0]);
    if(!elem) {
      return new HTMLAllCollection();
    }
    return proxyObject(elem);
  }

  const getElementsByTagNameNS = document.getElementsByTagNameNS;
  document.getElementsByTagNameNS = function() {
    const elem = getElementsByTagNameNS.call(document, arguments[0]);
    if(!elem) {
      return new HTMLAllCollection();
    }
    return proxyObject(elem);
  }
})(typeof window !== undefined ? window : null);