const Kai = (function() {

  function Kai(options) {
    this.init(options);
  }

  Kai.prototype.init = function(options) {

    const _this = this;
    this.id;
    this.name = 'Kai';
    this.data = {};
    this.template = '';
    this.templateUrl;
    this.methods = {};
    this.isMounted = false;
    this.$router;
    this.$state;
    this.softKeyListener = { left: {}, center: {}, right: {} };
    this.scrollThreshold = 0;
    this.listNavClass = '.kai-list-nav';
    this.listNavIndex = -1;
    this.tabNavClass = '.kai-tab-nav';
    this.tabNavIndex = -1;
    this.components = [];
    this.dPadNavListener = {
      arrowUp: function() {
        const DOM = document.getElementById(_this.id);
        DOM.scrollTop -= 20;
        _this.scrollThreshold = DOM.scrollTop;
      },
      arrowRight: function() {
        const DOM = document.getElementById(_this.id);
        DOM.scrollLeft = +20;
      },
      arrowDown: function() {
        const DOM = document.getElementById(_this.id);
        DOM.scrollTop += 20;
        _this.scrollThreshold = DOM.scrollTop;
      },
      arrowLeft: function() {
        const DOM = document.getElementById(_this.id);
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
      const accesssible = ['id','name', 'data', 'template' , 'templateUrl', 'methods', 'mounted', 'unmounted', 'router', 'state', 'softKeyListener', 'dPadNavListener', 'listNavClass', 'listNavIndex', 'tabNavClass', 'tabNavIndex', 'components'];
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

  Kai.prototype.unmounted = function(name) {}

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
    this.listNavIndex = -1;
    this.tabNavIndex = -1;
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
        return JSON.stringify(this);
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

    const listNav = document.querySelectorAll(this.listNavClass);
    if (listNav.length > 0 && this.id !== '__kai_header__' && this.id !==  '__kai_soft_key__') {
      if (this.listNavIndex === -1) {
        this.listNavIndex = 0;
      }
      const cur = listNav[this.listNavIndex];
      cur.focus();
      cur.classList.add('focus');
      cur.parentElement.scrollTop = cur.offsetTop - (cur.offsetHeight + (sk ? 30 : 0));
    }

    const tabHeader = document.getElementById(this.tabNavClass.replace('.', ''));
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
        li.setAttribute("class", this.tabNavClass.replace('.', ''));
        li.setAttribute("tabIndex", i);
        tabHeader.appendChild(li);
      });
    }

    const tabNav = document.querySelectorAll(this.tabNavClass);
    if (tabNav.length > 0 && this.id !== '__kai_header__' && this.id !==  '__kai_soft_key__') {
      if (this.tabNavIndex === -1) {
        this.tabNavIndex = 0;
      }
      const cur = tabNav[this.tabNavIndex];
      cur.focus();
      cur.classList.add('focus');
      cur.parentElement.scrollLeft = cur.offsetLeft - (cur.offsetWidth + (sk ? 30 : 0));
      const component = this.components[this.tabNavIndex].component;
      if (component instanceof Kai) {
        component.mount('__kai_tab__');
        this.$router.setLeftText(component.softKeyListener.left.text);
        this.$router.setCenterText(component.softKeyListener.center.text);
        this.$router.setRightText(component.softKeyListener.right.text);
      } else {
        const __kai_tab__ = document.getElementById('__kai_tab__');
        __kai_tab__.innerHTML = component;
        __kai_tab__.scrollTop = this.scrollThreshold;
        this.$router.setLeftText(this.softKeyListener.left.text);
        this.$router.setCenterText(this.softKeyListener.center.text);
        this.$router.setRightText(this.softKeyListener.right.text);
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
        const tabHeader = document.getElementById(this.tabNavClass.replace('.', ''));
        if (tabHeader) {
          padding += 30;
        }
        tabBody.style.setProperty('height', 'calc(100vh - ' +  padding.toString() + 'px)', 'important');
        tabBody.style.overflowY = 'hidden';
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
    } else if (['__kai_router__', '__kai_header__', '__kai_soft_key__', '__kai_dialog__', '__kai_tab__'].indexOf(this.id) === -1) {
      document.addEventListener('keydown', this.handleLocalKeydown.bind(this), true);
    }
  }

  Kai.prototype.removeKeydownListener = function() {
    if (this._router) {
      document.addEventListener('keydown', function(evt) {evt.stopPropagation();}, true);
    } else if (['__kai_router__', '__kai_header__', '__kai_soft_key__', '__kai_dialog__', '__kai_tab__'].indexOf(this.id) === -1) {
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
          e.preventDefault();
          e.stopPropagation();
        }
        break
      case 'SoftLeft':
        this.softKeyListener.left.func();
        break
      case 'SoftRight':
        this.softKeyListener.right.func();
        break
      case 'Enter':
        this.softKeyListener.center.func();
        break
      case 'ArrowUp':
        this.dPadNavListener.arrowUp();
        break
      case 'ArrowRight':
        this.dPadNavListener.arrowRight();
        break
      case 'ArrowDown':
        this.dPadNavListener.arrowDown();
        break
      case 'ArrowLeft':
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
    const target = evt.target.attributes.getNamedItem('click');
    if (evt.target.attributes.length > 0 && target) {
      if (target.nodeValue !== '') {
        const params = target.nodeValue.split(';');
        params.forEach(function(v) {
          var fName = v.substring(0, v.indexOf('('));
          var fParams = [];
          if (v.search(extractFuncRegex) !== -1) {
            var _fParams = v.substring((v.indexOf('(') +1), v.indexOf(')')).split(',');
            fParams = _fParams.length === 1 && _fParams[0] === '' ? [] : _fParams;
          }
          fParams.forEach(function(v, k) {
            fParams[k] = dataType(v, _this);
          });
          if (_this.methods[fName]) {
            _this.methods[fName].apply(null, fParams);
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
    this.nav(next, 'listNavIndex', 'listNavClass');
  }

  Kai.prototype.navigateTabNav = function(next) {
    this.nav(next, 'tabNavIndex', 'tabNavClass');
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
    const sk = document.getElementById('__kai_soft_key__');
    if (navClass === 'tabNavClass') {
      targetElement.parentElement.scrollLeft = targetElement.offsetLeft - (targetElement.offsetWidth + (sk ? 30 : 0));
    } else if (navClass === 'listNavClass') {
      targetElement.parentElement.scrollTop = targetElement.offsetTop - (targetElement.offsetHeight + (sk ? 30 : 0));
    }
  }

  return Kai;

})()

Kai.createTabNav = function(name, tabNavClass, components) {
  return new Kai({
    name: name,
    data: {},
    tabNavClass: tabNavClass,
    components: components,
    template: '<div><ul id="' + tabNavClass.replace('.', '') + '" class="kui-tab"></ul><div id="__kai_tab__"></div></div>',
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
          const component = this.components[this.tabNavIndex].component;
          if (component instanceof Kai) {
            component.softKeyListener.left.func();
          }
        }
      },
      center: {
        text: '',
        func: function() {
          const component = this.components[this.tabNavIndex].component;
          if (component instanceof Kai) {
            component.softKeyListener.center.func();
          }
        }
      },
      right: {
        text: '',
        func: function() {
          const component = this.components[this.tabNavIndex].component;
          if (component instanceof Kai) {
            component.softKeyListener.right.func();
          }
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        const component = this.components[this.tabNavIndex].component;
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
        const component = this.components[this.tabNavIndex].component;
        if (component instanceof Kai) {
          component.mount('__kai_tab__');
          __kai_tab__.scrollTop = component.scrollThreshold;
          this.$router.setLeftText(component.softKeyListener.left.text);
          this.$router.setCenterText(component.softKeyListener.center.text);
          this.$router.setRightText(component.softKeyListener.right.text);
        } else {
          __kai_tab__.innerHTML = component;
          __kai_tab__.scrollTop = this.scrollThreshold;
          this.$router.setLeftText(this.softKeyListener.left.text);
          this.$router.setCenterText(this.softKeyListener.center.text);
          this.$router.setRightText(this.softKeyListener.right.text);
        }
      },
      arrowDown: function() {
        const component = this.components[this.tabNavIndex].component;
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
        const component = this.components[this.tabNavIndex].component;
        if (component instanceof Kai) {
          component.mount('__kai_tab__');
          __kai_tab__.scrollTop = component.scrollThreshold;
          this.$router.setLeftText(component.softKeyListener.left.text);
          this.$router.setCenterText(component.softKeyListener.center.text);
          this.$router.setRightText(component.softKeyListener.right.text);
        } else {
          __kai_tab__.innerHTML = component;
          __kai_tab__.scrollTop = this.scrollThreshold;
          this.$router.setLeftText(this.softKeyListener.left.text);
          this.$router.setCenterText(this.softKeyListener.center.text);
          this.$router.setRightText(this.softKeyListener.right.text);
        }
      },
    }
  });
}
