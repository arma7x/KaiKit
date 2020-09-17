const KaiRouter = (function() {

  function KaiRouter(options) {
    this.init(options);
  }

  KaiRouter.prototype.init = function(options) {

    this._404 = new Kai({name: '404', template: '<div style="text-align:center;padding-top:50%;">404</div>'});
    this.title = '';
    this.routes = {};
    this.stack = [];
    this.header;
    this.softwareKey;
    this.dialog = false;

    this._KaiRouter = function (options) {
      const accesssible = ['routes', 'title'];
      for (var i in options) {
        if (accesssible.indexOf(i) !== -1) { // allow override
          if (i === 'routes') {
            if (typeof options[i] === 'object') {
              for (var path in options[i]) {
                const obj = options[i][path];
                if (obj.component && obj.component instanceof Kai) {
                  obj.component.$router = this;
                  this.routes[path] = obj;
                }
              }
            }
          } else {
            this[i] = options[i];
          }
        }
      }
    }
    this._KaiRouter(options);
  }

  function getURLParam(key, target) {
    var values = [];
    if (!target) target = location.href;

    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

    var pattern = key + '=([^&#]+)';
    var o_reg = new RegExp(pattern,'ig');
    while (true){
      var matches = o_reg.exec(target);
      if (matches && matches[1]){
        values.push(matches[1]);
      } else {
        break;
      }
    }

    if (!values.length){
      return [];
    } else {
      return values.length == 1 ? [values[0]] : values;
    }
  }

  function createPageURLParam(paths) {
    const cols = [];
    paths.forEach(function(v) {
      cols.push('page[]=' + v);
    });
    if (cols.length > 0) {
      return  '?' + cols.join('&');
    }
    return '';
  }

  KaiRouter.prototype.run = function() {
    this.renderHeader();
    this.renderSoftKey();
    this.calcBodyHeight();
    const paths = getURLParam('page[]');
    if (paths.length === 0) {
      paths.push('index');
    }
    var pathname = window.location.pathname.replace(/\/$/, '');
    if (pathname.length === 0) {
      pathname = '/index.html';
    }
    window.history.pushState("/", "", pathname + createPageURLParam(paths));
    paths.forEach((path, k) => {
      if (k === (paths.length - 1)) {
        if (this.routes[path]) {
          const component = this.routes[path].component;
          if (component.isMounted === false) {
            this.stack.push(component);
          }
          // component.$router = this;
          this.setSoftKeyText(component.softKeyListener.left.text, component.softKeyListener.center.text, component.softKeyListener.right.text);
          component.mount('__kai_router__');
        } else {
          this._404.mount('__kai_router__');
          this._404.$router = this;
          this.setSoftKeyText(this._404.softKeyListener.left.text, this._404.softKeyListener.center.text, this._404.softKeyListener.right.text);
          this.stack.push(this._404);
        }
      } else {
        if (this.routes[path]) {
          const clone = this.routes[path].component.reset();
          // clone.$router = this;
          this.stack.push(clone);
        } else {
          this._404.mount('__kai_router__');
          this._404.$router = this;
          this.setSoftKeyText(this._404.softKeyListener.left.text, this._404.softKeyListener.center.text, this._404.softKeyListener.right.text);
          this.stack.push(this._404);
        }
        if (paths.length === this.stack.length) {
          return;
        }
      }
    });
    // console.log(this.stack);
  }

  KaiRouter.prototype.push = function(path) {
    if (this.dialog) {
      return;
    }
    const DOM = document.getElementById('__kai_router__');
    DOM.scrollTop = 0;
    var name = path;
    if (typeof path === 'string' && this.routes[path]) {
      const clone = this.routes[path].component.reset();
      this.setSoftKeyText(clone.softKeyListener.left.text, clone.softKeyListener.center.text, clone.softKeyListener.right.text);
      clone.mount('__kai_router__');
      this.stack.push(clone);
    } else if (path instanceof Kai) {
      const clone = path.reset();
      clone.$router = this;
      clone.mount('__kai_router__');
      this.setSoftKeyText(clone.softKeyListener.left.text, clone.softKeyListener.center.text, clone.softKeyListener.right.text);
      this.stack.push(clone);
      name = clone.name;
    } else {
      this._404.mount('__kai_router__');
      this._404.$router = this;
      this.setSoftKeyText(this._404.softKeyListener.left.text, this._404.softKeyListener.center.text, this._404.softKeyListener.right.text);
      this.stack.push(this._404);
    }
    const paths = getURLParam('page[]');
    paths.push(name);
    var pathname = window.location.pathname.replace(/\/$/, '');
    if (pathname.length === 0) {
      pathname = '/index.html';
    }
    window.history.pushState("/", "", pathname + createPageURLParam(paths));
  }

  KaiRouter.prototype.pop = function() {
    if (this.dialog) {
      return;
    }
    const paths = getURLParam('page[]');
    var pathname = window.location.pathname.replace(/\/$/, '');
    if (pathname.length === 0) {
      pathname = '/index.html';
    }
    if ((paths.length > 0 && this.stack.length) > 0 && (paths.length === this.stack.length)) {
      var r = false;
      if ((this.stack.length - 1) > 0) {
        paths.pop();
        this.stack.pop();
        const DOM = document.getElementById('__kai_router__');
        if (DOM) {
          if (DOM.__kaikit__ != undefined && DOM.__kaikit__ instanceof Kai && DOM.__kaikit__.id === '__kai_router__') {
            // console.log('unmount previous:', DOM.__kaikit__.name);
            DOM.__kaikit__.unmount();
            DOM.removeEventListener('click', DOM.__kaikit__.handleClick);
          }
        }
        const component = this.stack[this.stack.length - 1];
        this.setSoftKeyText(component.softKeyListener.left.text, component.softKeyListener.center.text, component.softKeyListener.right.text);
        component.mount('__kai_router__');
        DOM.scrollTop = this.stack[this.stack.length - 1].scrollThreshold;
        r = true;
      }
      window.history.pushState("/", "", pathname + createPageURLParam(paths));
      return r;
    } else {
      return false;
    }
    return false;
  }

  KaiRouter.prototype.showDialog = function(title, body, dataCb, positiveText, positiveCb, negativeText, negativeCb, neutralText, neutralCb) {
    if (document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    const _this = this;
    const d = new Kai({
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
            _this.hideDialog();
          }
        },
        center: {
          text: neutralText || '',
          func: function() {
            if (typeof neutralCb === 'function') {
              neutralCb(dataCb);
            }
            _this.hideDialog();
          }
        },
        right: {
          text: positiveText || 'Yes',
          func: function() {
            if (typeof positiveCb === 'function') {
              positiveCb(dataCb);
            }
            _this.hideDialog();
          }
        }
      }
    });
    d.mount('__kai_dialog__');
    this.setSoftKeyText(d.softKeyListener.left.text, d.softKeyListener.center.text, d.softKeyListener.right.text);
    this.dialog = true;
    this.stack.push(d);
    const DOM = document.getElementById('__kai_dialog__');
    DOM.classList.add('kui-overlay');
    DOM.style.height = 'calc(100% - 30px)';
    DOM.style.zIndex = '1';
    DOM.style.visibility =  'visible';
    DOM.style.transition = 'opacity 0.1s linear';
  }

  KaiRouter.prototype.hideDialog = function() {
    if (!this.dialog) {
      return;
    }
    this.dialog = false;
    this.stack.pop();
    const component = this.stack[this.stack.length -1];
    this.setSoftKeyText(component.softKeyListener.left.text, component.softKeyListener.center.text, component.softKeyListener.right.text);
    const DOM = document.getElementById('__kai_dialog__');
    if (DOM) {
      if (DOM.__kaikit__ != undefined && DOM.__kaikit__ instanceof Kai && DOM.__kaikit__.id === '__kai_dialog__') {
        // console.log('unmount previous:', DOM.__kaikit__.name);
        DOM.__kaikit__.unmount();
        DOM.removeEventListener('click', DOM.__kaikit__.handleClick);
      }
    }
    DOM.style.height = '0';
    DOM.style.zIndex = '-1';
    DOM.style.visibility =  'hidden';
    DOM.style.transition = 'visibility 0s 0.1s, opacity 0.1s linear';
  }

  KaiRouter.prototype.showOptionMenu = function(title, options, selectText, selectCb, verticalNavIndex = -1) {
    if (document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    const _this = this;
    const d = new Kai({
      name: 'dialog',
      data: {
        title: title,
        options: options
      },
      verticalNavClass: '.optMenuNav',
      verticalNavIndex: verticalNavIndex,
      template: '\
      <div class="kui-option-menu">\
        <div class="kui-option-title">{{ title }}</div>\
        <div class="kui-option-body" style="margin:0;padding:0;">\
          <ul id="kui-options" class="kui-options">\
            {{#options}}\
            <li class="optMenuNav" click="selectOption(\{{__stringify__}}\)">{{text}}</li>\
            {{/options}}\
          </ul>\
        </div>\
      </div>',
      methods: {
        selectOption: function(data) {
          if (typeof selectCb === 'function') {
            selectCb(data);
            _this.hideOptionMenu();
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
    d.mount('__kai_dialog__');
    this.setSoftKeyText(d.softKeyListener.left.text, d.softKeyListener.center.text, d.softKeyListener.right.text);
    this.dialog = true;
    this.stack.push(d);
    const DOM = document.getElementById('__kai_dialog__');
    DOM.classList.add('kui-overlay');
    DOM.style.height = 'calc(100% - 30px)';
    DOM.style.zIndex = '1';
    DOM.style.visibility =  'visible';
    DOM.style.transition = 'opacity 0.1s linear';
  }

  KaiRouter.prototype.hideOptionMenu = function() {
    this.hideDialog();
  }

  KaiRouter.prototype.calcBodyHeight = function() {
    var padding = 0;
    const body = document.getElementById('__kai_router__');
    const header = document.getElementById('__kai_header__');
    if (header) {
      padding += 28;
      body.style.marginTop = '28px';
    }
    const sk = document.getElementById('__kai_soft_key__');
    if (sk) {
      padding += 30;
      body.style.marginBottom = '30px';
    }
    if (padding > 0) {
      body.style.setProperty('height', 'calc(' + window.innerHeight + 'px - ' +  padding.toString() + 'px)', 'important');
    }
    body.style.width = '100%';
  }

  KaiRouter.prototype.renderHeader = function() {
    const EL = document.getElementById('__kai_header__');
    if (EL) {
      this.header = new Kai({
        name: '_header_',
        data: {
          title: ''
        },
        template: '<span id="__kai_header_title__" style="margin-left: 5px;font-weight:300;font-size:17px;">{{ title }}</span>',
        mounted: function() {
          EL.classList.add('kui-header');
        },
        methods: {
          setHeaderTitle: function(txt) {
            this.setData({ title: txt });
          }
        }
      });
      this.header.mount('__kai_header__');
      this.header.methods.setHeaderTitle(this.title);
    }
  }

  KaiRouter.prototype.setHeaderTitle = function(txt) {
    this.header.methods.setHeaderTitle(txt);
  }

  KaiRouter.prototype.renderSoftKey = function() {
    const _this = this;
    const EL = document.getElementById('__kai_soft_key__');
    if (EL) {
      this.softwareKey = new Kai({
        name: '_software_key_',
        data: {
          left: '',
          center: '',
          right: ''
        },
        template: '<div click="clickLeft()" style="width:32%;text-align:left;padding-left:5px;font-weight:600;font-size:14px;">{{ left }}</div><div click="clickCenter()" style="width:36%;text-align:center;font-weight:600;text-transform:uppercase;">{{ center }}</div><div click="clickRight()" style="width:32%;text-align:right;padding-right:5px;font-weight:600;font-size:14px;">{{ right }}</div>',
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
            _this.clickLeft();
          },
          setCenterText: function(txt) {
            this.setData({ center: txt });
          },
          clickCenter: function() {
            _this.clickCenter();
          },
          setRightText: function(txt) {
            this.setData({ right: txt });
          },
          clickRight: function() {
            _this.clickRight();
          },
        }
      });
      this.softwareKey.mount('__kai_soft_key__');
      this.softwareKey.methods.setLeftText('');
      this.softwareKey.methods.setCenterText('');
      this.softwareKey.methods.setRightText('');
    }
  }

  KaiRouter.prototype.setSoftKeyText = function(l, c, r) {
    this.softwareKey.methods.setText(l, c, r);
  }

  KaiRouter.prototype.setSoftKeyLeftText = function(txt) {
    this.softwareKey.methods.setLeftText(txt);
  }

  KaiRouter.prototype.setSoftKeyCenterText = function(txt) {
    this.softwareKey.methods.setCenterText(txt);
  }

  KaiRouter.prototype.setSoftKeyRightText = function(txt) {
    this.softwareKey.methods.setRightText(txt);
  }

  KaiRouter.prototype.clickLeft = function() {
    if (this.stack[this.stack.length - 1].softKeyListener) {
      if (this.stack[this.stack.length - 1].softKeyListener.left) {
        if (typeof this.stack[this.stack.length - 1].softKeyListener.left.func === 'function') {
          this.stack[this.stack.length - 1].softKeyListener.left.func();
        }
      }
    }
  }

  KaiRouter.prototype.clickCenter = function() {
    if (this.stack[this.stack.length - 1].softKeyListener) {
      if (this.stack[this.stack.length - 1].softKeyListener.center) {
        if (typeof this.stack[this.stack.length - 1].softKeyListener.center.func === 'function') {
          this.stack[this.stack.length - 1].softKeyListener.center.func();
        }
      }
    }
  }

  KaiRouter.prototype.clickRight = function() {
    if (this.stack[this.stack.length - 1].softKeyListener) {
      if (this.stack[this.stack.length - 1].softKeyListener.right) {
        if (typeof this.stack[this.stack.length - 1].softKeyListener.right.func === 'function') {
          this.stack[this.stack.length - 1].softKeyListener.right.func();
        }
      }
    }
  }

  KaiRouter.prototype.arrowUp = function() {
    if (this.stack[this.stack.length - 1]) {
      if (typeof this.stack[this.stack.length - 1].dPadNavListener.arrowUp === 'function') {
        this.stack[this.stack.length - 1].dPadNavListener.arrowUp();
      }
    }
  }

  KaiRouter.prototype.arrowRight = function() {
    if (this.stack[this.stack.length - 1]) {
      if (typeof this.stack[this.stack.length - 1].dPadNavListener.arrowRight === 'function') {
        this.stack[this.stack.length - 1].dPadNavListener.arrowRight();
      }
    }
  }

  KaiRouter.prototype.arrowDown = function() {
    if (this.stack[this.stack.length - 1]) {
      if (typeof this.stack[this.stack.length - 1].dPadNavListener.arrowDown === 'function') {
        this.stack[this.stack.length - 1].dPadNavListener.arrowDown();
      }
    }
  }

  KaiRouter.prototype.arrowLeft = function() {
    if (this.stack[this.stack.length - 1]) {
      if (typeof this.stack[this.stack.length - 1].dPadNavListener.arrowLeft === 'function') {
        this.stack[this.stack.length - 1].dPadNavListener.arrowLeft();
      }
    }
  }

  KaiRouter.prototype.backKey = function() {
    if (this.stack[this.stack.length - 1]) {
      if (typeof this.stack[this.stack.length - 1].backKeyListener === 'function') {
        this.stack[this.stack.length - 1].backKeyListener();
      }
    }
  }

  KaiRouter.prototype.handleKeydown = function(e, _router) {
    switch(e.key) {
      case "BrowserBack":
      case 'Backspace':
      case 'EndCall':
        if (document.activeElement.tagName === 'INPUT') {
          if (document.activeElement.value.length === 0) {
            document.activeElement.blur();
          }
          return;
        }
        if (_router) {
          const isStop = _router.backKey();
          if (isStop === true) {
            return;
          }
        }
        if (_router.dialog) {
          _router.hideDialog();
        } else {
          if (_router) {
            _router.pop();
          }
        }
        break
      case 'SoftLeft':
        if (_router) {
          _router.clickLeft();
        }
        break
      case 'SoftRight':
        if (_router) {
          _router.clickRight();
        }
        break
      case 'Enter':
        if (document.activeElement.tagName === 'INPUT') {
          return;
        }
        if (_router) {
          _router.clickCenter();
        }
        break
      case 'ArrowUp':
        if (_router) {
          _router.arrowUp();
        }
        break
      case 'ArrowRight':
        if (document.activeElement.tagName === 'INPUT') {
          return;
        }
        if (_router) {
          _router.arrowRight();
        }
        break
      case 'ArrowDown':
        if (_router) {
          _router.arrowDown();
        }
        break
      case 'ArrowLeft':
        if (document.activeElement.tagName === 'INPUT') {
          return;
        }
        if (_router) {
          _router.arrowLeft();
        }
        break
      default:
        // console.log(e.key);
    }
  }

  return KaiRouter;

})();
