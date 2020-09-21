const Kai = (function() {

  function Kai(options) {
    this.init(options);
  }

  Kai.prototype.init = function(options) {

    this.id;
    this.name = 'Kai';
    this.data = {};
    this.template = '';
    this.templateUrl;
    this.methods = {};
    this.isMounted = false;
    this.$router;
    this.$state;
    this.scrollThreshold = 0;
    this.verticalNavClass = '.kai-list-nav';
    this.verticalNavIndex = -1;
    this.horizontalNavClass = '.kai-tab-nav';
    this.horizontalNavIndex = -1;
    this.components = [];
    this.softKeyListener = { left: {}, center: {}, right: {} };
    this.backKeyListener = function(evt) {};
    this.dPadNavListener = {
      arrowUp: () => {
        const DOM = document.getElementById(this.id);
        DOM.scrollTop -= 20;
        this.scrollThreshold = DOM.scrollTop;
      },
      arrowRight: () => {
        const DOM = document.getElementById(this.id);
        DOM.scrollLeft = +20;
      },
      arrowDown: () => {
        const DOM = document.getElementById(this.id);
        DOM.scrollTop += 20;
        this.scrollThreshold = DOM.scrollTop;
      },
      arrowLeft: () => {
        const DOM = document.getElementById(this.id);
        DOM.scrollLeft = -20;
      },
    };
    this._router;
    this._state;
    this._options;
    this._data;

    this._Kai = function (options) {
      this._options = options;
      this._data = JSON.stringify(options.data);
      const accesssible = ['id','name', 'data', 'template' , 'templateUrl', 'methods', 'mounted', 'unmounted', 'router', 'state', 'softKeyListener', 'dPadNavListener', 'verticalNavClass', 'verticalNavIndex', 'horizontalNavClass', 'horizontalNavIndex', 'components', 'backKeyListener'];
      for (var i in options) {
        if (accesssible.indexOf(i) !== -1) {
          if (i === 'methods') {
            for (f in options[i]) {
              if (typeof options[i][f] === 'function') {
                this[i][f] = options[i][f].bind(this);
              }
            }
          } else if (i === 'softKeyListener') {
            for (f in options[i]) {
              this.softKeyListener[f] = options[i][f];
              for (g in options[i][f]) {
                if (typeof options[i][f][g] === 'function') {
                  this[i][f][g] = options[i][f][g].bind(this);
                }
              }
            }
          } else if (i === 'dPadNavListener') {
            for (f in options[i]) {
              if (typeof options[i][f] === 'function') {
                this[i][f] = options[i][f].bind(this);
              }
            }
          } else if (i === 'backKeyListener' && typeof options[i] === 'function') {
            this[i] = options[i].bind(this);
          } else if (i === 'router' && options[i] instanceof KaiRouter) {
            this._router = options[i];
            this.$router = this._router;
          } else if (i === 'state' && options[i] instanceof KaiState) {
            this._state = options[i];
            this.$state = this._state;
            if (options['router'] && options['router'] instanceof KaiRouter) {
              for (var path in options['router'].routes) {
                const obj = options['router'].routes[path];
                if (obj.component && obj.component instanceof Kai) {
                  obj.component.$state = this.$state;
                }
              }
            }
          } else {
            this[i] = options[i];
          }
        }
      }
    }
    this._Kai(options);
  }

  Kai.prototype.mounted = function() {}

  Kai.prototype.unmounted = function() {}

  Kai.prototype.mount = function(id) {
    this.id = id;
    const DOM = document.getElementById(id);
    if (!DOM) {
      return;
    }
    if ((DOM.__kaikit__ !== undefined || DOM.__kaikit__ !== null) && DOM.__kaikit__ instanceof Kai && this.id !== '__kai_router__' && this.id !== '__kai_tab__') {
      // console.log('unmount previous:', DOM.__kaikit__.name);
      DOM.__kaikit__.unmount();
      DOM.removeEventListener('click', this.handleClick);
    }
    DOM.__kaikit__ = this;
    DOM.addEventListener('click', this.handleClick);
    this.addKeydownListener();

    if (this.isMounted) {
      this.render();
      return;
    }
    if (!this.templateUrl) {
      this.exec();
      this.mounted();
    } else {
      const xhttp = new XMLHttpRequest({ mozSystem: true });
      xhttp.onreadystatechange = (evt) => {
        if (evt.target.readyState == 4 && evt.target.status == 200) {
          this.template = xhttp.responseText;
          this.exec();
          this.mounted();
        }
      };
      xhttp.open('GET', this.templateUrl, true);
      xhttp.send();
    }
  }

  Kai.prototype.unmount = function() {
    this.isMounted = false;
    this.components.forEach((v) => {
      if (v.component instanceof Kai) {
        v.component.unmount();
      }
    });
    this.scrollThreshold = 0;
    this.verticalNavIndex = -1;
    this.horizontalNavIndex = -1;
    this.removeKeydownListener();
    this.unmounted();
  }

  Kai.prototype.exec = function() {
    this.render();
    if (this._router) {
      this._router.run();
    }
  }

  Kai.prototype.render = function() {
    const DOM = document.getElementById(this.id);
    if (!DOM) {
      return;
    }
    if (window.Mustache) {
      const data = JSON.parse(JSON.stringify(this.data));
      data['__stringify__'] = function () {
        if (typeof this === 'object') {
          return JSON.stringify(this);
        }
        return this;
      }
      if (this.$state) {
        data.$state = JSON.parse(JSON.stringify(this.$state.getState()));
      }
      DOM.innerHTML = window.Mustache.render(this.template, data);
    } else {
      DOM.innerHTML = this.template;
    }

    this.isMounted = true;

    const sk = document.getElementById('__kai_soft_key__');

    const listNav = document.querySelectorAll(this.verticalNavClass);
    if (listNav.length > 0 && this.id !== '__kai_header__' && this.id !==  '__kai_soft_key__') {
      if (this.verticalNavIndex === -1) {
        this.verticalNavIndex = 0;
      }
      const cur = listNav[this.verticalNavIndex];
      cur.focus();
      cur.classList.add('focus');
      cur.parentElement.scrollTop = cur.offsetTop - (cur.offsetHeight + (sk ? 30 : 0));
    }

    const tabHeader = document.getElementById(this.horizontalNavClass.replace('.', ''));
    if (tabHeader) {
      this.components.forEach((v, i) => {
        if (v.component instanceof Kai) {
          if (this.$router) {
            v.component.$router = this.$router;
          }
          if (this.$state) {
            v.component.$state = this.$state;
          }
          v.component.id = '__kai_tab__';
        }
        const li = document.createElement("LI");
        li.innerText = v.name;
        li.setAttribute("class", this.horizontalNavClass.replace('.', ''));
        li.setAttribute("tabIndex", i);
        tabHeader.appendChild(li);
      });
    }

    const tabNav = document.querySelectorAll(this.horizontalNavClass);
    if (tabNav.length > 0 && this.id !== '__kai_header__' && this.id !==  '__kai_soft_key__') {
      if (this.horizontalNavIndex === -1) {
        this.horizontalNavIndex = 0;
      }
      const cur = tabNav[this.horizontalNavIndex];
      cur.focus();
      cur.classList.add('focus');
      cur.parentElement.scrollLeft = cur.offsetLeft - (cur.offsetWidth + (sk ? 30 : 0));
      const component = this.components[this.horizontalNavIndex].component;
      if (component instanceof Kai) {
        component.mount('__kai_tab__');
        this.$router.setSoftKeyText(component.softKeyListener.left.text, component.softKeyListener.center.text, component.softKeyListener.right.text);
      } else {
        const __kai_tab__ = document.getElementById('__kai_tab__');
        __kai_tab__.innerHTML = component;
        __kai_tab__.scrollTop = this.scrollThreshold;
        this.$router.setSoftKeyText(this.softKeyListener.left.text, this.softKeyListener.center.text, this.softKeyListener.right.text);
      }

      const tabBody = document.getElementById('__kai_tab__');
      if (tabBody) {
        var padding = 0;
        const header = document.getElementById('__kai_header__');
        if (header) {
          padding += 28;
        }
        if (sk) {
          padding += 30;
        }
        const tabHeader = document.getElementById(this.horizontalNavClass.replace('.', ''));
        if (tabHeader) {
          padding += 30;
        }
        if (padding === 28) {
          tabBody.classList.add('kui-tab-h-28');
        } else if (padding === 30) {
          tabBody.classList.add('kui-tab-h-30');
        } else if (padding === 60) {
          tabBody.classList.add('kui-tab-h-60');
        } else if (padding === 58) {
          tabBody.classList.add('kui-tab-h-58');
        } else if (padding === 88) {
          tabBody.classList.add('kui-tab-h-88');
        }
      }
    }
  }

  Kai.prototype.setData = function(data) {
    this.data = Object.assign(JSON.parse(JSON.stringify(this.data)), data);
    this.exec();
  }

  Kai.prototype.addKeydownListener = function() {
    if (this._router) {
      document.addEventListener('keydown', this.handleRouterKeydown.bind(this));
    } else if (['__kai_router__', '__kai_header__', '__kai_soft_key__', '__kai_bottom_sheet__', '__kai_tab__'].indexOf(this.id) === -1) {
      document.addEventListener('keydown', this.handleLocalKeydown.bind(this), true);
    }
  }

  Kai.prototype.removeKeydownListener = function() {
    if (this._router) {
      document.addEventListener('keydown', function(evt) {evt.stopPropagation();}, true);
    } else if (['__kai_router__', '__kai_header__', '__kai_soft_key__', '__kai_bottom_sheet__', '__kai_tab__'].indexOf(this.id) === -1) {
      document.addEventListener('keydown', function(evt) {evt.stopPropagation();}, true);
    }
  }

  Kai.prototype.handleRouterKeydown = function(evt) {
    this._router.handleKeydown(evt, this._router);
  }

  Kai.prototype.handleLocalKeydown = function(evt) {
    switch(evt.key) {
      case "BrowserBack":
      case 'Backspace':
      case 'EndCall':
        if (document.activeElement.tagName === 'INPUT') {
          if (document.activeElement.value.length === 0) {
            document.activeElement.blur();
          }
          return
        }
        if (typeof this.backKeyListener === 'function') {
          const isStop = this.backKeyListener();
          if (isStop === true) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
        break
      case 'SoftLeft':
        this.softKeyListener.left.func();
        break
      case 'SoftRight':
        this.softKeyListener.right.func();
        break
      case 'Enter':
        if (document.activeElement.tagName === 'INPUT') {
          return
        }
        this.softKeyListener.center.func();
        break
      case 'ArrowUp':
        if (document.activeElement.tagName === 'INPUT') {
          document.activeElement.blur();
        }
        this.dPadNavListener.arrowUp();
        break
      case 'ArrowRight':
        if (document.activeElement.tagName === 'INPUT') {
          return
        }
        this.dPadNavListener.arrowRight();
        break
      case 'ArrowDown':
        if (document.activeElement.tagName === 'INPUT') {
          document.activeElement.blur();
        }
        this.dPadNavListener.arrowDown();
        break
      case 'ArrowLeft':
        if (document.activeElement.tagName === 'INPUT') {
          return
        }
        this.dPadNavListener.arrowLeft();
        break
      default:
        // console.log(evt.key);
    }
  }

  Kai.prototype.handleClick = function(evt) {

    function dataType(n, scope) {
      if (!isNaN(parseFloat(n)) && isFinite(n)) {
        return parseFloat(n);
      } else if (scope[n]) {
        return scope[n];
      } else {
        try {
          return JSON.parse(n);
        } catch(e) {
          if ((n.charAt(0) === "'" && n.charAt(n.length - 1) === "'") || (n.charAt(0) === '"' && n.charAt(n.length - 1) === '"')) {
            const n2 = n.split('');
            n2.splice(0,1);
            n2.pop();
            n = n2.join('');
          }
          return n;
        }
      }
    }

    evt.stopImmediatePropagation();
    var _this = this.__kaikit__;
    var extractFuncRegex = /\b[^()]+\((.*)\)$/;
    const target = evt.target.attributes.getNamedItem('@click');
    if (evt.target.attributes.length > 0 && target) {
      if (target.nodeValue !== '') {
        const params = target.nodeValue.split(';');
        params.forEach(function(v) {
          var fName = v.substring(0, v.indexOf('('));
          var fParams = v.substring((v.indexOf('(') +1), v.indexOf(')'));
          if (_this.methods[fName]) {
            _this.methods[fName].apply(null, [dataType(fParams, _this)]);
          }
        });
      }
    }
  }

  Kai.prototype.reset = function(data) {
    if (typeof data === 'object') {
      this.data = JSON.parse(JSON.stringify(data));
    } else {
      this.data = JSON.parse(this._data);
    }
    return this;
  }

  Kai.prototype.navigateListNav = function(next) {
    this.nav(next, 'verticalNavIndex', 'verticalNavClass');
  }

  Kai.prototype.navigateTabNav = function(next) {
    this.nav(next, 'horizontalNavIndex', 'horizontalNavClass');
  }

  Kai.prototype.nav = function(next, navIndex, navClass) {
    const currentIndex = this[navIndex];
    const nav = document.querySelectorAll(this[navClass]);
    if (nav.length === 0) {
      return
    }
    var move = currentIndex + next;
    var targetElement = nav[move];
    if (targetElement !== undefined) {
      targetElement.focus();
      this[navIndex] = move;
    } else {
      if (move < 0) {
        move = nav.length - 1;
      } else if (move >= nav.length) {
        move = 0;
      }
      targetElement = nav[move];
      targetElement.focus();
      this[navIndex] = move;
    }
    targetElement.classList.add('focus');
    if (currentIndex > -1) {
      nav[currentIndex].classList.remove('focus');
    }
    const header = document.getElementById('__kai_header__');
    const sk = document.getElementById('__kai_soft_key__');
    if (navClass === 'horizontalNavClass') {
      targetElement.parentElement.scrollLeft = targetElement.offsetLeft - targetElement.offsetWidth;
    } else if (navClass === 'verticalNavClass') {
      if (((this[navIndex] + 1) * targetElement.clientHeight - (header ? 28 : 0)) > targetElement.parentElement.clientHeight) {
        // targetElement.parentElement.scrollTop = targetElement.offsetTop - (targetElement.offsetHeight + (sk ? 30 : 0));
        targetElement.parentElement.scrollTop = targetElement.offsetTop - targetElement.parentElement.clientHeight + (sk ? 22 : 0);
      } else {
        targetElement.parentElement.scrollTop = 0;
      }
    }
  }

  return Kai;

})()

Kai.createTabNav = function(name, horizontalNavClass, components) {
  return new Kai({
    name: name,
    data: {},
    horizontalNavClass: horizontalNavClass,
    components: components,
    template: '<div><ul id="' + horizontalNavClass.replace('.', '') + '" class="kui-tab"></ul><div id="__kai_tab__"></div></div>',
    mounted: function() {
      if (this.$state) {
        this.$state.addGlobalListener(this.methods.globalState);
      }
    },
    unmounted: function() {
      if (this.$state) {
        this.$state.removeGlobalListener(this.methods.globalState);
      }
    },
    methods: {
      globalState: function(data) {
        if (this.$router) {
          if (this.$router.stack[this.$router.stack.length - 1]) {
            if (this.$router.stack[this.$router.stack.length - 1].name === this.name) {
              this.render();
            }
          }
        }
        
      }
    },
    softKeyListener: {
      left: {
        text: '',
        func: function() {
          const component = this.components[this.horizontalNavIndex].component;
          if (component instanceof Kai) {
            component.softKeyListener.left.func();
          }
        }
      },
      center: {
        text: '',
        func: function() {
          const component = this.components[this.horizontalNavIndex].component;
          if (component instanceof Kai) {
            component.softKeyListener.center.func();
          }
        }
      },
      right: {
        text: '',
        func: function() {
          const component = this.components[this.horizontalNavIndex].component;
          if (component instanceof Kai) {
            component.softKeyListener.right.func();
          }
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        const component = this.components[this.horizontalNavIndex].component;
        if (component instanceof Kai) {
          component.dPadNavListener.arrowUp();
        } else {
          const __kai_tab__ = document.getElementById('__kai_tab__');
          __kai_tab__.scrollTop -= 20;
          this.scrollThreshold = __kai_tab__.scrollTop;
        }
        
      },
      arrowRight: function() {
        this.navigateTabNav(+1);
        const __kai_tab__ = document.getElementById('__kai_tab__');
        const component = this.components[this.horizontalNavIndex].component;
        if (component instanceof Kai) {
          component.mount('__kai_tab__');
          __kai_tab__.scrollTop = component.scrollThreshold;
          this.$router.setSoftKeyText(component.softKeyListener.left.text, component.softKeyListener.center.text, component.softKeyListener.right.text);
        } else {
          __kai_tab__.innerHTML = component;
          __kai_tab__.scrollTop = this.scrollThreshold;
          this.$router.setSoftKeyText(this.softKeyListener.left.text, this.softKeyListener.center.text, this.softKeyListener.right.text);
        }
      },
      arrowDown: function() {
        const component = this.components[this.horizontalNavIndex].component;
        if (component instanceof Kai) {
          component.dPadNavListener.arrowDown();
        } else {
          const __kai_tab__ = document.getElementById('__kai_tab__');
          __kai_tab__.scrollTop += 20;
          this.scrollThreshold = __kai_tab__.scrollTop;
        }
      },
      arrowLeft: function() {
        this.navigateTabNav(-1);
        const __kai_tab__ = document.getElementById('__kai_tab__');
        const component = this.components[this.horizontalNavIndex].component;
        if (component instanceof Kai) {
          component.mount('__kai_tab__');
          __kai_tab__.scrollTop = component.scrollThreshold;
          this.$router.setSoftKeyText(component.softKeyListener.left.text, component.softKeyListener.center.text, component.softKeyListener.right.text);
        } else {
          __kai_tab__.innerHTML = component;
          __kai_tab__.scrollTop = this.scrollThreshold;
          this.$router.setSoftKeyText(this.softKeyListener.left.text, this.softKeyListener.center.text, this.softKeyListener.right.text);
        }
      },
    }
  });
}

Kai.createHeader = function(EL, $router) {
  return new Kai({
    name: '_header_',
    data: {
      title: ''
    },
    template: '{{ title }}',
    mounted: function() {
      EL.classList.add('kui-header');
    },
    methods: {
      setHeaderTitle: function(txt) {
        this.setData({ title: txt });
      }
    }
  });
}

Kai.createSoftKey = function(EL, $router) {
  return new Kai({
    name: '_software_key_',
    data: {
      left: '',
      center: '',
      right: ''
    },
    template: '<div @click="clickLeft()" class="kui-software-key-left">{{ left }}</div><div @click="clickCenter()" class="kui-software-key-center">{{ center }}</div><div @click="clickRight()" class="kui-software-key-right">{{ right }}</div>',
    mounted: function() {
      EL.classList.add('kui-software-key');
    },
    methods: {
      setText: function(l, c, r) {
        this.setData({ left: l, center: c, right: r });
      },
      setLeftText: function(txt) {
        this.setData({ left: txt });
      },
      clickLeft: function() {
        $router.clickLeft();
      },
      setCenterText: function(txt) {
        this.setData({ center: txt });
      },
      clickCenter: function() {
        $router.clickCenter();
      },
      setRightText: function(txt) {
        this.setData({ right: txt });
      },
      clickRight: function() {
        $router.clickRight();
      },
    }
  });
}

Kai.createOptionMenu = function(title, options, selectText, selectCb, verticalNavIndex = -1, $router) {
  return new Kai({
    name: 'option_menu',
    data: {
      title: title,
      options: options
    },
    verticalNavClass: '.optMenuNav',
    verticalNavIndex: verticalNavIndex,
    template: '\
    <div class="kui-option-menu">\
      <div class="kui-option-title">{{ title }}</div>\
      <div class="kui-option-body">\
        <ul id="kui-options" class="kui-options">\
          {{#options}}\
            <li class="optMenuNav" @click=\'selectOption({{__stringify__}})\'>{{text}}</li>\
          {{/options}}\
        </ul>\
      </div>\
    </div>',
    methods: {
      selectOption: function(data) {
        if (typeof selectCb === 'function') {
          selectCb(data);
        }
        if ($router) {
          $router.hideOptionMenu();
        }
      }
    },
    softKeyListener: {
      left: {
        text: '',
        func: function() {}
      },
      center: {
        text: selectText || 'SELECT',
        func: function() {
          const listNav = document.querySelectorAll(this.verticalNavClass);
          if (this.verticalNavIndex > -1) {
            listNav[this.verticalNavIndex].click();
          }
        }
      },
      right: {
        text: '',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowRight: function() {},
      arrowDown: function() {
        this.navigateListNav(1);
      },
      arrowLeft: function() {},
    }
  });
}

Kai.createDialog = function(title, body, dataCb, positiveText, positiveCb, negativeText, negativeCb, neutralText, neutralCb, $router) {
  return new Kai({
    name: 'dialog',
    data: {
      title: title,
      body: body
    },
    template: '<div class="kui-option-menu"><div class="kui-option-title">{{ title }}</div><div class="kui-option-body">{{ body }}</div></div>',
    softKeyListener: {
      left: {
        text: negativeText || 'Cancel',
        func: function() {
          if (typeof negativeCb === 'function') {
            negativeCb(dataCb);
          }
          if ($router) {
            $router.hideDialog();
          }
        }
      },
      center: {
        text: neutralText || '',
        func: function() {
          if (typeof neutralCb === 'function') {
            neutralCb(dataCb);
          }
          if ($router) {
            $router.hideDialog();
          }
        }
      },
      right: {
        text: positiveText || 'Yes',
        func: function() {
          if (typeof positiveCb === 'function') {
            positiveCb(dataCb);
          }
          if ($router) {
            $router.hideDialog();
          }
        }
      }
    }
  });
}

Kai.createSingleSelector = function(title, options, selectText, selectCb, cancelText, cancelCb, verticalNavIndex = -1, $router) {

  options = JSON.parse(JSON.stringify(options));
  options.forEach(function(v,k) {
    if (k === verticalNavIndex) {
      options[k]['checked'] = true;
    } else {
      options[k]['checked'] = false;
    }
  });

  return new Kai({
    name: 'single_selector',
    data: {
      title: title,
      options: options
    },
    verticalNavClass: '.optSSNav',
    verticalNavIndex: verticalNavIndex,
    template: '\
    <div class="kui-option-menu">\
      <div class="kui-option-title">{{ title }}</div>\
      <div class="kui-option-body">\
        <ul id="kui-options" class="kui-options">\
          {{#options}}\
            <li class="optSSNav" @click=\'selectOption({{__stringify__}})\'>\
              <div class="kui-row-center">\
                {{text}}\
                {{#checked}}\
                  <input type="radio" checked>\
                {{/checked}}\
                {{^checked}}\
                  <input type="radio">\
                {{/checked}}\
                \
              </div>\
            </li>\
          {{/options}}\
        </ul>\
      </div>\
    </div>',
    methods: {
      selectOption: function(data) {
        if (typeof selectCb === 'function') {
          selectCb(data);
        }
        if ($router) {
          $router.hideSingleSelector();
        }
      }
    },
    softKeyListener: {
      left: {
        text: cancelText || 'Cancel',
        func: function() {
          if (typeof cancelCb === 'function') {
            cancelCb(data);
          }
          if ($router) {
            $router.hideSingleSelector();
          }
        }
      },
      center: {
        text: selectText || 'SELECT',
        func: function() {
          const listNav = document.querySelectorAll(this.verticalNavClass);
          if (this.verticalNavIndex > -1) {
            listNav[this.verticalNavIndex].click();
          }
        }
      },
      right: {
        text: '',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowRight: function() {},
      arrowDown: function() {
        this.navigateListNav(1);
      },
      arrowLeft: function() {},
    }
  });
}

Kai.createMultiSelector = function(title, options, selectText, selectCb, saveText, saveCb, cancelText, cancelCb, verticalNavIndex = -1, $router) {

  options = JSON.parse(JSON.stringify(options));
  const focus = options[verticalNavIndex === -1 ? 0 : verticalNavIndex];
  if (focus) {
    if (focus.checked) {
      selectText = 'DESELECT';
    } else {
      selectText = 'SELECT';
    }
  }

  const multi_selector = new Kai({
    name: 'multi_selector',
    data: {
      title: title,
      options: options
    },
    verticalNavClass: '.optMSNav',
    verticalNavIndex: verticalNavIndex,
    template: '\
    <div class="kui-option-menu">\
      <div class="kui-option-title">{{ title }}</div>\
      <div class="kui-option-body">\
        <ul id="kui-options" class="kui-options">\
          {{#options}}\
            <li class="optMSNav" @click=\'selectOption({{__stringify__}})\'>\
              <div class="kui-row-center">\
                {{text}}\
                {{#checked}}\
                  <input type="checkbox" checked>\
                {{/checked}}\
                {{^checked}}\
                  <input type="checkbox">\
                {{/checked}}\
              </div>\
            </li>\
          {{/options}}\
        </ul>\
      </div>\
    </div>',
    methods: {
      selectOption: function(data) {
        data['checked'] = !data['checked'];
        const idx = this.data.options.findIndex((opt) => {
          return opt.text === data.text;
        });
        if (idx > -1) {
          this.data.options[idx] = data;
          if (data.checked) {
            $router.setSoftKeyCenterText('DESELECT');
          } else {
            $router.setSoftKeyCenterText('SELECT');
          }
          this.setData({ options: this.data.options });
        }
        if (typeof selectCb === 'function') {
          selectCb(data);
        }
      }
    },
    softKeyListener: {
      left: {
        text: cancelText || 'Cancel',
        func: function() {
          if (typeof cancelCb === 'function') {
            cancelCb(data);
          }
          if ($router) {
            $router.hideSingleSelector();
          }
        }
      },
      center: {
        text: selectText || 'SELECT',
        func: function() {
          const listNav = document.querySelectorAll(this.verticalNavClass);
          if (this.verticalNavIndex > -1) {
            listNav[this.verticalNavIndex].click();
          }
        }
      },
      right: {
        text: saveText || 'Save',
        func: function() {
          if (typeof saveCb === 'function') {
            saveCb(this.data.options);
          }
          if ($router) {
            $router.hideSingleSelector();
          }
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
        const focus = this.data.options[this.verticalNavIndex];
        if (focus) {
          if (focus.checked) {
            $router.setSoftKeyCenterText('DESELECT');
          } else {
            $router.setSoftKeyCenterText('SELECT');
          }
        }
      },
      arrowRight: function() {},
      arrowDown: function() {
        this.navigateListNav(1);
        const focus = this.data.options[this.verticalNavIndex];
        if (focus) {
          if (focus.checked) {
            $router.setSoftKeyCenterText('DESELECT');
          } else {
            $router.setSoftKeyCenterText('SELECT');
          }
        }
      },
      arrowLeft: function() {},
    }
  });
  return multi_selector.reset();
}

Kai.createDatePicker = function(year, month, day = 1, selectCb, $router) {

  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const today = new Date();
  day = day == undefined ? today.getDate() : day;
  month = month || today.getMonth() + 1;
  year = year || today.getFullYear();
  var MAX_DAY = new Date(year, month, 0).getDate();
  day = day <= MAX_DAY ? day : 1;

  return new Kai({
    name: 'date_picker',
    data: {
      title: 'Select Date',
      yearT: year - 1,
      yearM: year,
      yearB: year + 1,
      monthT: MONTHS[(month - 1) - 1] ? MONTHS[(month - 1) - 1] : '-',
      monthM: MONTHS[month - 1],
      monthB: MONTHS[(month - 1) + 1] ? MONTHS[(month - 1) + 1] : '-',
      dayT: day - 1 < 1 ? '-' : (day - 1),
      dayM: day,
      dayB: day + 1 > MAX_DAY ? '-' : (day + 1),
      selector: 0
    },
    template: '\
    <div class="kui-option-menu">\
      <div class="kui-option-title">{{ title }}</div>\
      <div class="kui-option-body">\
        <div class="kui-lcr-container">\
          <div class="kai-left-col">\
            <div class="kai-lcr-top">{{ dayT }}</div>\
            <div id="__kai_dp_day__" class="kai-lcr-mid">{{ dayM }}</div>\
            <div class="kai-lcr-bottom">{{ dayB }}</div>\
          </div>\
          <div class="kai-center-col">\
            <div class="kai-lcr-top">{{ monthT }}</div>\
            <div id="__kai_dp_month__" class="kai-lcr-mid">{{ monthM }}</div>\
            <div class="kai-lcr-bottom">{{ monthB }}</div>\
          </div>\
          <div class="kai-right-col">\
            <div class="kai-lcr-top">{{ yearT }}</div>\
            <div id="__kai_dp_year__" class="kai-lcr-mid">{{ yearM }}</div>\
            <div class="kai-lcr-bottom">{{ yearB }}</div>\
          </div>\
        </div>\
      </div>\
    </div>',
    mounted: function() {
      this.methods.focus();
    },
    unmounted: function() {},
    methods: {
      focus: function() {
        if (this.data.selector === 0) {
          document.getElementById('__kai_dp_day__').classList.add('kai-focus');
          document.getElementById('__kai_dp_month__').classList.remove('kai-focus');
          document.getElementById('__kai_dp_year__').classList.remove('kai-focus');
        } else if (this.data.selector === 1) {
          document.getElementById('__kai_dp_day__').classList.remove('kai-focus');
          document.getElementById('__kai_dp_month__').classList.add('kai-focus');
          document.getElementById('__kai_dp_year__').classList.remove('kai-focus');
        } else {
          document.getElementById('__kai_dp_day__').classList.remove('kai-focus');
          document.getElementById('__kai_dp_month__').classList.remove('kai-focus');
          document.getElementById('__kai_dp_year__').classList.add('kai-focus');
        }
      },
      setValue: function (val) {
        if (this.data.selector === 0) {
          const dayM = this.data.dayM + val;
          if (dayM > MAX_DAY || dayM < 1) {
            return;
          }
          const dayT = dayM - 1 < 1 ? '-' : (dayM - 1);
          const dayB = dayM + 1 > MAX_DAY ? '-' : (dayM + 1);
          this.setData({ dayT, dayM, dayB });
        } else if (this.data.selector === 1) {
          const oldMD = MAX_DAY;
          var idx = MONTHS.indexOf(this.data.monthM);
          idx += val;
          if (idx > 11 || idx < 0) {
            return
          }
          const monthT = MONTHS[idx - 1] ? MONTHS[idx - 1] : '-';
          const monthM = MONTHS[idx];
          const monthB = MONTHS[idx + 1] ? MONTHS[idx + 1] : '-';
          this.setData({ monthT, monthM, monthB });
          MAX_DAY = new Date(this.data.yearM, idx + 1, 0).getDate();
          if (this.data.dayM > MAX_DAY) {
            this.setData({ dayT: this.data.dayT - 1, dayM: this.data.dayM - 1, dayB: '-' });
          } else if (MAX_DAY > this.data.dayM && oldMD === this.data.dayM) {
            this.setData({ dayB: this.data.dayM + 1 });
          } else if (MAX_DAY === this.data.dayM && MAX_DAY < oldMD) {
            this.setData({ dayB: '-' });
          }
        } else {
          const yearM = this.data.yearM + val;
          const yearT = yearM - 1;
          const yearB = yearM + 1;
          this.setData({ yearT, yearM, yearB });
        }
        this.methods.focus();
      }
    },
    softKeyListener: {
      left: {
        text: 'Cancel',
        func: function() {
          if ($router) {
            $router.hideDatePicker();
          }
        }
      },
      center: {
        text: 'Save',
        func: function() {
          if (typeof selectCb === 'function') {
            selectCb(new Date(this.data.yearM, MONTHS.indexOf(this.data.monthM), this.data.dayM));
          }
          if ($router) {
            $router.hideDatePicker();
          }
        }
      },
      right: {
        text: '',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.methods.setValue(-1);
      },
      arrowDown: function() {
        this.methods.setValue(1);
      },
      arrowRight: function() {
        if (this.data.selector === 2) {
          this.setData({ selector: 0 });
        } else {
          this.setData({ selector: this.data.selector + 1 });
        }
        this.methods.focus();
      },
      arrowLeft: function() {
        if (this.data.selector === 0) {
          this.setData({ selector: 2 });
        } else {
          this.setData({ selector: this.data.selector - 1 });
        }
        this.methods.focus();
      }
    }
  });
}

Kai.createTimePicker = function(hour, minute, is12H, selectCb, $router) {

  function twoChar(n) {
    return n < 10 ? '0' + n.toString() : n;
  }
  
  if (hour > 23) {
    hour = 0;
  }
  if (minute > 59) {
    minute = 0;
  }

  var  periodT = '-';
  var  periodM = '-';
  var  periodB = '-';

  if (is12H) {
    if (hour >= 12) {
      hour = hour > 12 ? hour - 12 : hour;
      periodT = 'AM';
      periodM = 'PM';
      periodB = '-';
    } else {
      periodT = '-';
      periodM = 'AM';
      periodB = 'PM';
    }
  } else {
    periodT = '-';
    periodM = '-';
    periodB = '-';
  }

  return new Kai({
    name: 'time_picker',
    data: {
      title: 'Select Time',
      hourT: is12H ? (hour - 1 > 0 ? twoChar(hour - 1) : '-') : (hour - 1 > 1 ? twoChar(hour) - 1 : '-'),
      hourM: twoChar(hour),
      hourB: is12H ? (hour + 1 < 13 ? twoChar(hour + 1) : '-') : (hour + 1 < 24 ? twoChar(hour + 1) : '-'),
      minuteT: minute - 1 < 0 ? '-' : twoChar(minute - 1),
      minuteM: twoChar(minute),
      minuteB: minute + 1 > 59 ? '-' : twoChar(minute + 1),
      periodT: periodT,
      periodM: periodM,
      periodB: periodB,
      is12H: is12H,
      selector: 0
    },
    template: '\
    <div class="kui-option-menu">\
      <div class="kui-option-title">{{ title }}</div>\
      <div class="kui-option-body">\
        <div class="kui-lcr-container">\
          <div class="kai-left-col">\
            <div class="kai-lcr-top">{{ hourT }}</div>\
            <div id="__kai_dp_hour__" class="kai-lcr-mid">{{ hourM }}</div>\
            <div class="kai-lcr-bottom">{{ hourB }}</div>\
          </div>\
          <div class="kai-center-col">\
            <div class="kai-lcr-top">{{ minuteT }}</div>\
            <div id="__kai_dp_minute__" class="kai-lcr-mid">{{ minuteM }}</div>\
            <div class="kai-lcr-bottom">{{ minuteB }}</div>\
          </div>\
          {{#is12H}}\
          <div class="kai-right-col">\
            <div class="kai-lcr-top">{{ periodT }}</div>\
            <div id="__kai_dp_period__" class="kai-lcr-mid">{{ periodM }}</div>\
            <div class="kai-lcr-bottom">{{ periodB }}</div>\
          </div>\
          {{/is12H}}\
        </div>\
      </div>\
    </div>',
    mounted: function() {
      this.methods.focus();
    },
    unmounted: function() {},
    methods: {
      focus: function() {
        if (this.data.selector === 0) {
          document.getElementById('__kai_dp_hour__').classList.add('kai-focus');
          document.getElementById('__kai_dp_minute__').classList.remove('kai-focus');
          if (this.data.is12H) {
            document.getElementById('__kai_dp_period__').classList.remove('kai-focus');
          }
        } else if (this.data.selector === 1) {
          document.getElementById('__kai_dp_hour__').classList.remove('kai-focus');
          document.getElementById('__kai_dp_minute__').classList.add('kai-focus');
          if (this.data.is12H) {
            document.getElementById('__kai_dp_period__').classList.remove('kai-focus');
          }
        } else {
          document.getElementById('__kai_dp_hour__').classList.remove('kai-focus');
          document.getElementById('__kai_dp_minute__').classList.remove('kai-focus');
          if (this.data.is12H) {
            document.getElementById('__kai_dp_period__').classList.add('kai-focus');
          }
        }
      },
      setValue: function (val) {
        if (this.data.selector === 0) {
          var hourM = parseInt(this.data.hourM) + val;
          if (hourM < (this.data.is12H ? 1 : 0) || hourM > (this.data.is12H ? 12 : 23)) {
            return;
          }
          var hourT = !this.data.is12H ? (hourM - 1 > -1 ? twoChar(hourM - 1) : '-') : (hourM - 1 > 0 ? twoChar(hourM - 1) : '-');
          var hourB = !this.data.is12H ? (hourM + 1 < 24 ? twoChar(hourM + 1) : '-') : (hourM + 1 < 13 ? twoChar(hourM + 1) : '-');
          hourM = twoChar(hourM);
          this.setData({ hourT, hourM, hourB });
        } else if (this.data.selector === 1) {
          var minuteM = parseInt(this.data.minuteM) + val;
          if (minuteM < 0 || minuteM > 59) {
            return;
          }
          var minuteT = minuteM - 1 < 0 ? '-' : twoChar(minuteM - 1);
          var minuteB = minuteM + 1 > 59 ? '-' : twoChar(minuteM + 1);
          minuteM = twoChar(minuteM);
          this.setData({ minuteT, minuteM, minuteB });
        } else {
          if (this.data.periodM === 'PM' && val === -1) {
            this.setData({ periodT: '-', periodM: 'AM', periodB: 'PM' });
          } else if (this.data.periodM === 'AM' && val === 1){
            this.setData({ periodT: 'AM', periodM: 'PM', periodB: '-' });
          }
        }
        this.methods.focus();
      }
    },
    softKeyListener: {
      left: {
        text: 'Cancel',
        func: function() {
          if ($router) {
            $router.hideTimePicker();
          }
        }
      },
      center: {
        text: 'Save',
        func: function() {
          if (typeof selectCb === 'function') {
            var h = parseInt(this.data.hourM);
            var m = parseInt(this.data.minuteM)
            if (this.data.is12H) {
              if (parseInt(this.data.hourM) < 12 && this.data.periodM === 'PM') {
                h = parseInt(this.data.hourM) + 12;
              }
            }
            const dt = new Date();
            dt.setHours(h, m, 0);
            selectCb(dt);
          }
          if ($router) {
            $router.hideTimePicker();
          }
        }
      },
      right: {
        text: '',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.methods.setValue(-1);
      },
      arrowDown: function() {
        this.methods.setValue(1);
      },
      arrowRight: function() {
        if (this.data.selector === 2) {
          this.setData({ selector: 0 });
        } else {
          this.setData({ selector: this.data.selector + 1 });
        }
        this.methods.focus();
      },
      arrowLeft: function() {
        if (this.data.selector === 0) {
          this.setData({ selector: 2 });
        } else {
          this.setData({ selector: this.data.selector - 1 });
        }
        this.methods.focus();
      }
    }
  });
}
