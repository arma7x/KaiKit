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
        // console.log('stock arrowUp');
        const vdom = document.getElementById(_this.id);
        vdom.scrollTop -= 20;
        _this.scrollThreshold = vdom.scrollTop;
      },
      arrowRight: function() {
        // console.log('stock arrowRight');
        const vdom = document.getElementById(_this.id);
        vdom.scrollLeft = +20;
      },
      arrowDown: function() {
        // console.log('stock arrowDown');
        const vdom = document.getElementById(_this.id);
        vdom.scrollTop += 20;
        _this.scrollThreshold = vdom.scrollTop;
      },
      arrowLeft: function() {
        // console.log('stock arrowLeft');
        const vdom = document.getElementById(_this.id);
        vdom.scrollLeft = -20;
      },
    };
    this._router;
    this._state;
    this._options;
    this._data;

    this._Kai = function (options) {
      this._options = options;
      this._data = JSON.stringify(options.data);
      const public = ['id','name', 'data', 'template' , 'templateUrl', 'methods', 'mounted', 'unmounted', 'router', 'state', 'softKeyListener', 'dPadNavListener', 'listNavClass', 'tabNavClass', 'components'];
      for (var i in options) {
        if (public.indexOf(i) !== -1) { // allow override
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

  Kai.prototype.mounted = function() {
    // console.log('execute mounted:', this.name);
  }

  Kai.prototype.unmounted = function(name) {
    // console.log('execute unmounted:', this.name);
  }

  Kai.prototype.mount = function(id) {
    this.id = id;
    // console.log('MOUNT', this.name, this.isMounted, this.id);
    const vdom = document.getElementById(id);
    if (!vdom) {
      return;
    }
    if ((vdom.__kaikit__ !== undefined || vdom.__kaikit__ !== null) && vdom.__kaikit__ instanceof Kai && this.id !== '__kai_router__' && this.id !== '__kai_tab__') {
      console.log('unmount previous:', vdom.__kaikit__.name);
      vdom.__kaikit__.unmount();
      vdom.removeEventListener('click', this.handleClick);
    }
    vdom.__kaikit__ = this;
    vdom.addEventListener('click', this.handleClick);
    this.addKeydownListener();

    if (this.isMounted) {
      this.render();
      // console.log('RE-RENDER', this.name, this.isMounted);
      return;
    }
    // console.log('mounting:', this.name);
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
      // console.log(this.templateUrl);
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
      // console.log(this.name, 'exec routing', this.isMounted);
      this._router.run();
    }
  }

  Kai.prototype.render = function() {
    // console.log('RENDER', this.name, this.isMounted, this.id);
    const vdom = document.getElementById(this.id);
    if (!vdom) {
      return;
    }
    if (window.Mustache) {
      const data = JSON.parse(JSON.stringify(this.data));
      if (this.$state) {
        data.$state = JSON.parse(JSON.stringify(this.$state.getState()));
      }
      vdom.innerHTML = window.Mustache.render(this.template, data);
    } else {
      vdom.innerHTML = this.template;
    }
    const listNav = document.querySelectorAll(this.listNavClass);
    if (listNav.length > 0 && this.id !== '__kai_header__' && this.id !==  '__kai_soft_key__') {
      if (this.listNavIndex === -1) {
        this.listNavIndex = 0;
      }
      listNav[this.listNavIndex].focus();
      listNav[this.listNavIndex].classList.add('focus');
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
      tabNav[this.tabNavIndex].focus();
      tabNav[this.tabNavIndex].classList.add('focus');
      if (this.components[this.tabNavIndex].component instanceof Kai) {
        this.components[this.tabNavIndex].component.mount('__kai_tab__');
        this.$router.setLeftText(this.components[this.tabNavIndex].component.softKeyListener.left.text);
        this.$router.setCenterText(this.components[this.tabNavIndex].component.softKeyListener.center.text);
        this.$router.setRightText(this.components[this.tabNavIndex].component.softKeyListener.right.text);
      } else {
        const __kai_tab__ = document.getElementById('__kai_tab__');
        __kai_tab__.innerHTML = this.components[this.tabNavIndex].component;
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
        const sk = document.getElementById('__kai_soft_key__');
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
    this.isMounted = true;
  }

  Kai.prototype.setData = function(data) {
    this.data = Object.assign(JSON.parse(JSON.stringify(this.data)), data); // immutability
    this.exec();
  }

  Kai.prototype.addKeydownListener = function() {
    if (this._router) {
      // console.log('addKeydownListener', this.id);
      document.addEventListener('keydown', this.handleRouterKeydown.bind(this));
    } else if (['__kai_router__', '__kai_header__', '__kai_soft_key__', '__kai_option_menu__', '__kai_dialog__', '__kai_tab__'].indexOf(this.id) === -1) {
      // console.log('addKeydownListener', this.id);
      document.addEventListener('keydown', this.handleLocalKeydown.bind(this), true);
    }
  }

  Kai.prototype.removeKeydownListener = function() {
    if (this._router) {
      // console.log('removeKeydownListener', this.id);
      document.addEventListener('keydown', function(evt) {evt.stopPropagation();}, true);
    } else if (['__kai_router__', '__kai_header__', '__kai_soft_key__', '__kai_option_menu__', '__kai_dialog__', '__kai_tab__'].indexOf(this.id) === -1) {
      // console.log('removeKeydownListener', this.id);
      document.addEventListener('keydown', function(evt) {evt.stopPropagation();}, true);
    }
  }

  Kai.prototype.handleRouterKeydown = function(evt) {
    // console.log('handleRouterKeydown', this.id);
    this._router.handleKeydown(evt, this._router);
  }

  Kai.prototype.handleLocalKeydown = function(evt) {
    // console.log('handleLocalKeydown', this.id);
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
        if ((n.charAt(0) === "'" && n.charAt(n.length - 1) === "'") || (n.charAt(0) === '"' && n.charAt(n.length - 1) === '"')) {
          const n2 = n.split('');
          n2.splice(0,1);
          n2.pop();
          n = n2.join('');
        }
        return n;
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
    nav[currentIndex].classList.remove('focus');
    if (navClass === 'tabNavClass') {
      const ul = document.getElementById(this[navClass].replace('.', ''));
      var threshold = targetElement.offsetWidth;
      for(var i=0;i<this[navIndex];i++) {
        threshold += nav[i].offsetWidth;
      }
      if (threshold < window.innerWidth) {
        ul.scrollLeft = 0;
      } else {
        ul.scrollLeft = (ul.scrollLeft + targetElement.offsetWidth);
      }
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
      // console.log('mounted:', this.name);
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
    },
    methods: {},
    softKeyListener: {
      left: {
        text: 'Push',
        func: function() {
          if (this.components[this.tabNavIndex].component instanceof Kai) {
            this.components[this.tabNavIndex].component.softKeyListener.left.func();
          } else {
            this.$router.push('third');
            // DEFAULT ACTION
          }
        }
      },
      center: {
        text: '',
        func: function() {
          if (this.components[this.tabNavIndex].component instanceof Kai) {
            this.components[this.tabNavIndex].component.softKeyListener.center.func();
          } else {
            // DEFAULT ACTION
          }
        }
      },
      right: {
        text: 'Pop',
        func: function() {
          if (this.components[this.tabNavIndex].component instanceof Kai) {
            this.components[this.tabNavIndex].component.softKeyListener.right.func();
          } else {
            this.$router.pop();
            // DEFAULT ACTION
          }
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        if (this.components[this.tabNavIndex].component instanceof Kai) {
          this.components[this.tabNavIndex].component.dPadNavListener.arrowUp();
        } else {
          const __kai_tab__ = document.getElementById('__kai_tab__');
          __kai_tab__.scrollTop -= 20;
          this.scrollThreshold = __kai_tab__.scrollTop;
        }
        
      },
      arrowRight: function() {
        this.navigateTabNav(+1);
        if (this.components[this.tabNavIndex].component instanceof Kai) {
          this.components[this.tabNavIndex].component.mount('__kai_tab__');
          this.$router.setLeftText(this.components[this.tabNavIndex].component.softKeyListener.left.text);
          this.$router.setCenterText(this.components[this.tabNavIndex].component.softKeyListener.center.text);
          this.$router.setRightText(this.components[this.tabNavIndex].component.softKeyListener.right.text);
        } else {
          const __kai_tab__ = document.getElementById('__kai_tab__');
          __kai_tab__.innerHTML = this.components[this.tabNavIndex].component;
          __kai_tab__.scrollTop = this.scrollThreshold;
          this.$router.setLeftText(this.softKeyListener.left.text);
          this.$router.setCenterText(this.softKeyListener.center.text);
          this.$router.setRightText(this.softKeyListener.right.text);
        }
      },
      arrowDown: function() {
        if (this.components[this.tabNavIndex].component instanceof Kai) {
          this.components[this.tabNavIndex].component.dPadNavListener.arrowDown();
        } else {
          const __kai_tab__ = document.getElementById('__kai_tab__');
          __kai_tab__.scrollTop += 20;
          this.scrollThreshold = __kai_tab__.scrollTop;
        }
      },
      arrowLeft: function() {
        this.navigateTabNav(-1);
        if (this.components[this.tabNavIndex].component instanceof Kai) {
          this.components[this.tabNavIndex].component.mount('__kai_tab__');
          this.$router.setLeftText(this.components[this.tabNavIndex].component.softKeyListener.left.text);
          this.$router.setCenterText(this.components[this.tabNavIndex].component.softKeyListener.center.text);
          this.$router.setRightText(this.components[this.tabNavIndex].component.softKeyListener.right.text);
        } else {
          const __kai_tab__ = document.getElementById('__kai_tab__');
          __kai_tab__.innerHTML = this.components[this.tabNavIndex].component;
          __kai_tab__.scrollTop = this.scrollThreshold;
          this.$router.setLeftText(this.softKeyListener.left.text);
          this.$router.setCenterText(this.softKeyListener.center.text);
          this.$router.setRightText(this.softKeyListener.right.text);
        }
      },
    }
  });
}
