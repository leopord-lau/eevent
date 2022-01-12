(function(global) {
  const document = global.document;
  const eventMatchReg = /(on)([\w]*)/;
  class BaseEvent {
    constructor(ele) {
      this.element = ele;
      this._events = {};
      this.rewriteAddEventListener();
      this.rewriteRemoveEventListener();
      ele.getAllEventListeners = this.getAllEventListeners.bind(this);
      ele.getAllEvents = this.getAllEvents.bind(this)
    }
    rewriteAddEventListener() {
      const addEventListener = this.element.addEventListener;
      const _ = this;
      this.element.addEventListener = function() {
        _.addEvent(arguments[0], arguments[1])
        addEventListener.call(this.element, arguments[0], arguments[1])
      }
    }
    rewriteRemoveEventListener() {
      const removeEventlistener = this.element.removeEventListener;
      const _ = this;
      this.element.removeEventListener = function() {
        _.removeEvent(arguments[0]);
        removeEventlistener.call(this.element, arguments[0], arguments[1]);
      }
    }
    addEvent(eventName, callback) {
      if(this._events[eventName]) {
        this._events[eventName].push(callback);
      } else {
        this._events[eventName] = [callback];
      }
    }
    removeEvent(eventName) {
      delete this._events[eventName];
    }
    getAllEvents() {
      return Object.getOwnPropertyNames(this._events);
    }
    getAllEventListeners() {
      return this._events;
    }
  }

  function extendElement(ele) {
    console.log(ele)
    if(!ele) {
      return null;
    }
    if(!ele._extends) {
      ele._extends = new BaseEvent(ele);
      extractEventsFromAttribute(ele);
    }
    return ele;
  }

  function extractEventsFromAttribute(ele) {
    const names = ele.getAttributeNames();
    if(names.length) {
      names.forEach((name) => {
        if(result = name.match(eventMatchReg)) {
          const value = ele.getAttribute(name);
          const fn = eval(narmalizeFunctionName(value));
          ele._extends.addEvent(result[2], fn);
        }
      })
    }
    return ele;
  }

  function narmalizeFunctionName(name) {
    if(name.includes('(') && name.includes(')') && (name.indexOf('(') < name.indexOf(')'))) {
      return name.slice(0, name.indexOf('('));
    } else {
      return name;
    }
  }

  const createElement = document.createElement;
  document.createElement = function() {
    const newElem = createElement.call(document, arguments[0], arguments[1])
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
      get: (obj, prop) => {
        return extendElement(obj[prop]);
      }
    }

    const proxyObject = new Proxy(obj, hanlder);
    return proxyObject;
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

  const querySelector = document.querySelector;
  document.querySelector = function() {
    const elem = querySelector.call(document, arguments[0]);
    return extendElement(elem);
  }

  const querySelectorAll = document.querySelectorAll;
  document.querySelectorAll = function() {
    const elem = querySelectorAll.call(document, arguments[0]);
    if(!elem) {
      return new NodeList();
    }
    return proxyObject(elem);
  }

  extendElement(document.body);

})(typeof window !== 'undefined' ? window : null);