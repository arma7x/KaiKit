const KaiRouter = (function() {

  function KaiRouter(options) {
    this.init(options);
  }

  KaiRouter.prototype.init = function(options) {

    this._404 = new Kai({name: '404', template: '<div class="kai-404">404</div>'});
    this.title = '';
    this.routes = {};
    this.stack = [];
    this.header;
    this.softwareKey;
    this.bottomSheet = false;

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
    this.mountHeader();
    this.mountSoftKey();
    this.calcRouterHeight();
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
    if (this.bottomSheet) {
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
    if (this.bottomSheet) {
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

  KaiRouter.prototype.showBottomSheet = function(component) {
    component.mount('__kai_bottom_sheet__');
    this.setSoftKeyText(component.softKeyListener.left.text, component.softKeyListener.center.text, component.softKeyListener.right.text);
    this.bottomSheet = true;
    this.stack.push(component);
    const DOM = document.getElementById('__kai_bottom_sheet__');
    const SK = document.getElementById('__kai_soft_key__');
    DOM.classList.add('kui-overlay');
    if (SK) {
      DOM.classList.add('kui-overlay-visible');
      SK.classList.add('kui-software-key-dark');
    } else {
      DOM.classList.add('kui-overlay-visible-no-sk');
    }
  }

  KaiRouter.prototype.hideBottomSheet = function() {
    if (!this.bottomSheet) {
      return;
    }
    this.bottomSheet = false;
    this.stack.pop();
    const component = this.stack[this.stack.length -1];
    this.setSoftKeyText(component.softKeyListener.left.text, component.softKeyListener.center.text, component.softKeyListener.right.text);
    const DOM = document.getElementById('__kai_bottom_sheet__');
    const SK = document.getElementById('__kai_soft_key__');
    if (DOM) {
      if (DOM.__kaikit__ != undefined && DOM.__kaikit__ instanceof Kai && DOM.__kaikit__.id === '__kai_bottom_sheet__') {
        // console.log('unmount previous:', DOM.__kaikit__.name);
        DOM.__kaikit__.unmount();
        DOM.removeEventListener('click', DOM.__kaikit__.handleClick);
      }
    }
    if (SK) {
      DOM.classList.remove('kui-overlay-visible');
      SK.classList.remove('kui-software-key-dark');
    } else {
      DOM.classList.remove('kui-overlay-visible-no-sk');
    }
  }

  KaiRouter.prototype.showDialog = function(title, body, dataCb, positiveText, positiveCb, negativeText, negativeCb, neutralText, neutralCb) {
    if (document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    const dialog = Kai.createDialog(title, body, dataCb, positiveText, positiveCb, negativeText, negativeCb, neutralText, neutralCb, this);
    this.showBottomSheet(dialog);
  }

  KaiRouter.prototype.hideDialog = function() {
    this.hideBottomSheet();
  }

  KaiRouter.prototype.showOptionMenu = function(title, options, selectText, selectCb, verticalNavIndex = -1) {
    if (document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    const option_menu = Kai.createOptionMenu(title, options, selectText, selectCb, verticalNavIndex, this);
    this.showBottomSheet(option_menu);
  }

  KaiRouter.prototype.hideOptionMenu = function() {
    this.hideBottomSheet();
  }

  KaiRouter.prototype.showSingleSelector = function(title, options, selectText, selectCb, cancelText, cancelCb, verticalNavIndex = -1) {
    if (document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    const single_selector = Kai.createSingleSelector(title, options, selectText, selectCb, cancelText, cancelCb, verticalNavIndex, this);
    this.showBottomSheet(single_selector);
  }

  KaiRouter.prototype.hideSingleSelector = function() {
    this.hideBottomSheet();
  }

  KaiRouter.prototype.showMultiSelector = function(title, options, selectText, selectCb, saveText, saveCb, cancelText, cancelCb, verticalNavIndex = -1) {
    if (document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    const multi_selector = Kai.createMultiSelector(title, options, selectText, selectCb, saveText, saveCb, cancelText, cancelCb, verticalNavIndex, this);
    this.showBottomSheet(multi_selector);
  }

  KaiRouter.prototype.hideMultiSelector = function() {
    this.hideBottomSheet();
  }

  KaiRouter.prototype.showDatePicker = function(year, month, day = 1, selectCb) {
    if (document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    const date_picker = Kai.createDatePicker(year, month, day, selectCb, this);
    this.showBottomSheet(date_picker);
  }

  KaiRouter.prototype.hideDatePicker = function() {
    this.hideBottomSheet();
  }

  KaiRouter.prototype.showTimePicker = function(hour, minute, is24h = true, selectCb) {
    if (document.activeElement.tagName === 'INPUT') {
      document.activeElement.blur();
    }
    const time_picker = Kai.createTimePicker(hour, minute, is24h, selectCb, this);
    this.showBottomSheet(time_picker);
  }

  KaiRouter.prototype.hideTimePicker = function() {
    this.hideBottomSheet();
  }

  KaiRouter.prototype.calcRouterHeight = function() {
    var padding = 0;
    const body = document.getElementById('__kai_router__');
    const header = document.getElementById('__kai_header__');
    if (header) {
      padding += 28;
      body.classList.add('kui-router-m-top');
    }
    const sk = document.getElementById('__kai_soft_key__');
    if (sk) {
      padding += 30;
      body.classList.add('kui-router-m-bottom');
      
    }
    if (padding === 28) {
      body.classList.add('kui-router-h-hdr');
    } else if (padding === 30) {
      body.classList.add('kui-router-h-sk');
    } else if (padding === 58) {
      body.classList.add('kui-router-h-hdr-sk');
    }
  }

  KaiRouter.prototype.mountHeader = function() {
    const EL = document.getElementById('__kai_header__');
    if (EL) {
      this.header = Kai.createHeader(EL, this);
      this.header.mount('__kai_header__');
      this.header.methods.setHeaderTitle(this.title);
    }
  }

  KaiRouter.prototype.setHeaderTitle = function(txt) {
    this.header.methods.setHeaderTitle(txt);
  }

  KaiRouter.prototype.mountSoftKey = function() {
    const EL = document.getElementById('__kai_soft_key__');
    if (EL) {
      this.softwareKey = Kai.createSoftKey(EL, this);
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
        if (_router.bottomSheet) {
          _router.hideBottomSheet();
          e.preventDefault();
          e.stopPropagation();
        } else {
          if (_router) {
            if (_router.pop()) {
              e.preventDefault();
              e.stopPropagation();
            }
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
        if (document.activeElement.tagName === 'INPUT') {
          document.activeElement.blur();
        }
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
        if (document.activeElement.tagName === 'INPUT') {
          document.activeElement.blur();
        }
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
