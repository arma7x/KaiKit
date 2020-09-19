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
    if (window.Sqrl) {
      const data = JSON.parse(JSON.stringify(this.data));
      data['__stringify__'] = function () {
        return JSON.stringify(this);
      }
      if (this.$state) {
        data.$state = JSON.parse(JSON.stringify(this.$state.getState()));
      }
      DOM.innerHTML = window.Sqrl.render(this.template, data);
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
        tabBody.style.setProperty('height', 'calc(' + window.innerHeight + 'px - ' +  padding.toString() + 'px)', 'important');
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
        targetElement.parentElement.scrollTop = targetElement.offsetTop - (targetElement.offsetHeight + (sk ? 30 : 0));
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
    template: '<span id="__kai_header_title__" style="margin-left: 5px;font-weight:300;font-size:17px;">{{ it.title }}</span>',
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
    template: '<div @click="clickLeft()" style="width:32%;text-align:left;padding-left:5px;font-weight:600;font-size:14px;">{{ it.left }}</div><div @click="clickCenter()" style="width:36%;text-align:center;font-weight:600;text-transform:uppercase;">{{ it.center }}</div><div @click="clickRight()" style="width:32%;text-align:right;padding-right:5px;font-weight:600;font-size:14px;">{{ it.right }}</div>',
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
    name: 'dialog',
    data: {
      title: title,
      options: options
    },
    verticalNavClass: '.optMenuNav',
    verticalNavIndex: verticalNavIndex,
    template: '\
    <div class="kui-option-menu">\
      <div class="kui-option-title">{{ it.title }}</div>\
      <div class="kui-option-body" style="margin:0;padding:0;">\
        <ul id="kui-options" class="kui-options">\
          {{@each(it.options) => option}}\
            <li class="optMenuNav" @click=\'selectOption({{ JSON.stringify(option) | safe }})\'>{{option.text}}</li>\
          {{/each}}\
        </ul>\
      </div>\
    </div>',
    methods: {
      selectOption: function(data) {
        if (typeof selectCb === 'function') {
          selectCb(data);
          if ($router) {
            $router.hideOptionMenu();
          }
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

Kai.createValueSelector = function() {}

Kai.createDialog = function(title, body, dataCb, positiveText, positiveCb, negativeText, negativeCb, neutralText, neutralCb, $router) {
  return new Kai({
    name: 'dialog',
    data: {
      title: title,
      body: body
    },
    template: '<div class="kui-option-menu"><div class="kui-option-title">{{ it.title }}</div><div class="kui-option-body">{{ it.body }}</div></div>',
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
