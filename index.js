(function(global) {
  const document = global.document;
  const eventMatchReg = /(on)([\w]*)/;
  const eventList = ['abort', 'blur', 'change', 'click', 'dbclick', 'error', 'focus', 'keydown', 'keypress',
                    'keyup', 'load', 'mousedown', 'mousemove', 'mouseout', 'mouseup', 'reset', 'select', 'resize', 'submit', 'unload'];
  class BaseEvent {
    constructor(ele) {
      this.element = ele;
      this._events = {};
      this.rewriteAddEventListener();
      this.rewriteRemoveEventListener();
      this.observeAssignmentEvent();
      this.element.getAllEventListeners = this.getAllEventListeners.bind(this);
      this.element.getAllEvents = this.getAllEvents.bind(this)
    }
    observeAssignmentEvent() {
      const _ = this;
      eventList.forEach((item) => {
        Object.defineProperty(_.element, `on${item}`, {
          set(fn) {
            let i =  _.isAlreadyListenedByAssignment(item);
            if(fn) {
              if( i !== -1) {
                _.element.removeEventListener(item, _._events[item][i])
              }
              _.element.addEventListener(item, {value: fn, intro: 'add by assignment'});
              return;
            }
            if(i !== -1) {
              _.element.removeEventListener(item, _._events[item][i])
            }
          }
        })
      })
    }
    isAlreadyListenedByAssignment(item) {
      if(!this._events[item] || this._events[item].length === 0) {
        return -1;
      }
      let idx = -1;
      this._events[item].forEach((item, i) => {
        if(typeof item === 'object') {
          if(item.intro === 'add by assignment') {
            idx = i;
            return;
          }
        }
      })
      return idx;
    }
    rewriteAddEventListener() {
      const addEventListener = this.element.addEventListener;
      const _ = this;
      this.element.addEventListener = function() {
        _.addEvent(arguments[0], arguments[1]);
        if(typeof arguments[1] === 'object') {
          addEventListener.call(_.element, arguments[0], arguments[1].value, arguments[2])
        }
        addEventListener.call(_.element, arguments[0], arguments[1], arguments[2])
      }
    }
    rewriteRemoveEventListener() {
      const removeEventlistener = this.element.removeEventListener;
      const _ = this;
      this.element.removeEventListener = function() {
        if(_.removeEvent(arguments[0], arguments[1])){
          if(typeof arguments[1] === 'object') {
            removeEventlistener.call(_.element, arguments[0], arguments[1].value);
          }
          removeEventlistener.call(_.element, arguments[0], arguments[1]);
        }
      }
    }
    addEvent(eventName, callback) {
      if(this._events[eventName]) {
        this._events[eventName].push(callback);
      } else {
        this._events[eventName] = [callback];
      }
    }
    removeEvent(eventName, fn) {
      if(!this._events[eventName]) {
        console.warn(`event ${eventName} has no listener`);
        return false;
      }
      if(!fn) {
        console.warn('listener function is expected');
        return false;
      }
      if(this._events[eventName].includes(fn)) {
        this._events[eventName].splice(this._events[eventName].indexOf(fn), 1);
        this.deleteEvent(eventName);
        return true;
      } else {
        console.warn(`${fn} is not listen by event ${eventName}`);
        return false;
      }
    }
    deleteEvent(eventName) {
      if(this._events[eventName].length === 0) {
        delete this._events[eventName]
      }
    }
    getAllEvents() {
      return Object.getOwnPropertyNames(this._events);
    }
    getAllEventListeners() {
      return this._events;
    }
  }

  function extendElement(ele) {
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
    return extendElement(newElem);
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

})(window);