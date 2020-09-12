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
      const public = ['routes', 'title'];
      for (var i in options) {
        if (public.indexOf(i) !== -1) { // allow override
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
          component.mount('__kai_router__');
          this.setLeftText(component.softKeyListener.left.text);
          this.setCenterText(component.softKeyListener.center.text);
          this.setRightText(component.softKeyListener.right.text);
          this.addKeydownListener();
        } else {
          this._404.mount('__kai_router__');
          this._404.$router = this;
          this.setLeftText(this._404.softKeyListener.left.text);
          this.setCenterText(this._404.softKeyListener.center.text);
          this.setRightText(this._404.softKeyListener.right.text);
          this.addKeydownListener();
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
          this.setLeftText(this._404.softKeyListener.left.text);
          this.setCenterText(this._404.softKeyListener.center.text);
          this.setRightText(this._404.softKeyListener.right.text);
          this.addKeydownListener();
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
    const vdom = document.getElementById('__kai_router__');
    vdom.scrollTop = 0;
    var name = path;
    if (typeof path === 'string' && this.routes[path]) {
      const clone = this.routes[path].component.reset();
      clone.mount('__kai_router__');
      this.setLeftText(clone.softKeyListener.left.text);
      this.setCenterText(clone.softKeyListener.center.text);
      this.setRightText(clone.softKeyListener.right.text);
      this.stack.push(clone);
    } else if (path instanceof Kai) {
      const clone = path.reset();
      clone.$router = this;
      clone.mount('__kai_router__');
      this.setLeftText(clone.softKeyListener.left.text);
      this.setCenterText(clone.softKeyListener.center.text);
      this.setRightText(clone.softKeyListener.right.text);
      this.stack.push(clone);
      name = clone.name;
    } else {
      this._404.mount('__kai_router__');
      this._404.$router = this;
      this.setLeftText(this._404.softKeyListener.left.text);
      this.setCenterText(this._404.softKeyListener.center.text);
      this.setRightText(this._404.softKeyListener.right.text);
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
        const vdom = document.getElementById('__kai_router__');
        if (vdom) {
          if (vdom.__kaikit__ != undefined && vdom.__kaikit__ instanceof Kai && vdom.__kaikit__.id === '__kai_router__') {
            console.log('unmount previous:', vdom.__kaikit__.name);
            vdom.__kaikit__.unmount();
            vdom.removeEventListener('click', vdom.__kaikit__.handleClick);
          }
        }
        const component = this.stack[this.stack.length - 1];
        component.mount('__kai_router__');
        this.setLeftText(component.softKeyListener.left.text);
        this.setCenterText(component.softKeyListener.center.text);
        this.setRightText(component.softKeyListener.right.text);
        vdom.scrollTop = this.stack[this.stack.length - 1].scrollThreshold;
        r = true;
      }
      window.history.pushState("/", "", pathname + createPageURLParam(paths));
      return r;
    } else {
      return false;
    }
    return false;
  }

  KaiRouter.prototype.showDialog = function(title, body, dataCb, positiveText, positiveCb, negativeText, negativeCb) {
    const _this = this;
    const d = new Kai({
      name: 'dialog',
      data: {
        title: title,
        body: body
      },
      mustache: Mustache,
      template: '<div style="background-color:white;position:absolute;bottom:0;width:100%;">\
        <div style="padding-left:5px;height:28px;line-height:28px;background-color:#cccccc;text-align:center;">{{ title }}</div>\
        <div style="padding:5px;font-size:14px;">{{ body }}</div>\
        </div>',
      softKeyListener: {
        left: {
          text: negativeText || 'Cancel',
          func: function() {
            console.log(negativeText);
            if (typeof negativeCb === 'function') {
              negativeCb(dataCb);
            }
            _this.hideDialog();
          }
        },
        center: {
          text: '',
          func: function() {}
        },
        right: {
          text: positiveText || 'Yes',
          func: function() {
            console.log(positiveText);
            if (typeof positiveCb === 'function') {
              positiveCb(dataCb);
            }
            _this.hideDialog();
          }
        }
      }
    });
    d.mount('__kai_dialog__');
    this.setLeftText(d.softKeyListener.left.text);
    this.setCenterText(d.softKeyListener.center.text);
    this.setRightText(d.softKeyListener.right.text);
    this.dialog = true;
    this.stack.push(d);
    const vdom = document.getElementById('__kai_dialog__');
    vdom.style.position = 'fixed';
    vdom.style.backgroundColor = 'rgba(64,64,64,0.5)';
    vdom.style.height = 'calc(100% - 30px)';
    vdom.style.width = '100%';
    vdom.style.top = '0';
    vdom.style.zIndex = '1';
    vdom.style.visibility =  'visible';
    vdom.style.opacity = '1';
    vdom.style.transition = 'opacity 0.1s linear';
  }

  KaiRouter.prototype.hideDialog = function() {
    if (!this.dialog) {
      return;
    }
    this.dialog = false;
    this.stack.pop();
    this.setLeftText(this.stack[this.stack.length -1].softKeyListener.left.text);
    this.setCenterText(this.stack[this.stack.length -1].softKeyListener.center.text);
    this.setRightText(this.stack[this.stack.length -1].softKeyListener.right.text);
    const vdom = document.getElementById('__kai_dialog__');
    if (vdom) {
      if (vdom.__kaikit__ != undefined && vdom.__kaikit__ instanceof Kai && vdom.__kaikit__.id === '__kai_dialog__') {
        console.log('unmount previous:', vdom.__kaikit__.name);
        vdom.__kaikit__.unmount();
        vdom.removeEventListener('click', vdom.__kaikit__.handleClick);
      }
    }
    vdom.style.height = '0';
    vdom.style.width = '0';
    vdom.style.top = '0';
    vdom.style.zIndex = '-1';
    vdom.style.visibility =  'hidden';
    vdom.style.opacity = '0';
    vdom.style.transition = 'visibility 0s 0.1s, opacity 0.1s linear';
  }

  KaiRouter.prototype.calcBodyHeight = function() {
    var padding = 0;
    const body = document.getElementById('__kai_router__');
    const header = document.getElementById('__kai_header__');
    if (header) {
      padding += 28;
      body.style.paddingTop = '28px';
    }
    const sk = document.getElementById('__kai_soft_key__');
    if (sk) {
      padding += 30;
      body.style.paddingBottom = '30px';
    }
    if (padding > 0) {
      body.style.setProperty('height', 'calc(100vh - ' +  padding.toString() + 'px)', 'important');
      body.style.overflowY = 'scroll';
    }
  }

  KaiRouter.prototype.renderHeader = function() {
    const EL = document.getElementById('__kai_header__');
    if (EL) {
      this.header = new Kai({
        name: '_header_',
        data: {
          title: ''
        },
        mustache: Mustache,
        template: '<span id="__kai_header_title__" style="margin-left: 5px;font-weight:300;font-size:17px;">{{ title }}</span>',
        mounted: function() {
          EL.style.color = '#fff';
          EL.style.fontWeight = 'bold';
          EL.style.verticalAlign = 'middle';
          EL.style.backgroundColor = '#873eff';
          EL.style.height = '28px';
          EL.style.lineHeight = '28px';
          EL.style.position = 'fixed';
          EL.style.width =  '100%';
          EL.style.top = '0';
          EL.style.marginBottom = '28px';
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
        mustache: Mustache,
        template: '<div click="clickLeft()" style="width:32%;text-align:left;padding-left:5px;font-weight:600;font-size:14px;">{{ left }}</div><div click="clickCenter()" style="width:36%;text-align:center;font-weight:600;text-transform:uppercase;">{{ center }}</div><div click="clickRight()" style="width:32%;text-align:right;padding-right:5px;font-weight:600;font-size:14px;">{{ right }}</div>',
        mounted: function() {
          EL.style.height = '30px';
          EL.style.lineHeight = '30px';
          EL.style.backgroundColor = '#cccccc';
          EL.style.display = 'flex';
          EL.style.alignItems = 'center';
          EL.style.color = '#323232';
          EL.style.position = 'fixed';
          EL.style.width =  '100%';
          EL.style.bottom = '0';
        },
        methods: {
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

  KaiRouter.prototype.setLeftText = function(txt) {
    this.softwareKey.methods.setLeftText(txt);
  }

  KaiRouter.prototype.setCenterText = function(txt) {
    this.softwareKey.methods.setCenterText(txt);
  }

  KaiRouter.prototype.setRightText = function(txt) {
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

  KaiRouter.prototype.handleKeydown = function(e) {
    var _router;
    if (this.children.length > 0) {
      const child = this.children[0];
      if (child.__kaikit__) {
        if (child.__kaikit__._router) {
          _router = child.__kaikit__._router;
        }
      }
    }
    switch(e.key) {
      case "BrowserBack":
      case 'Backspace':
      case 'EndCall':
        if (document.activeElement.tagName === 'INPUT') {
          if (document.activeElement.value.length === 0) {
            document.activeElement.blur();
          }
          e.preventDefault();
          e.stopPropagation();
        } else if (_router.dialog) {
          _router.hideDialog();
          e.preventDefault();
          e.stopPropagation();
        } else {
          if (_router) {
            if (_router.pop()) {
              e.preventDefault();
              e.stopPropagation();
            } else {
              // console.log('ROOT');
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
        if (_router) {
          _router.clickCenter();
        }
        break
      case 'ArrowUp':
        _router.stack[_router.stack.length - 1].dPadNavListener.arrowUp();
        break
      case 'ArrowRight':
        _router.stack[_router.stack.length - 1].dPadNavListener.arrowRight();
        break
      case 'ArrowDown':
        _router.stack[_router.stack.length - 1].dPadNavListener.arrowDown();
        break
      case 'ArrowLeft':
        _router.stack[_router.stack.length - 1].dPadNavListener.arrowLeft();
        break
      default:
        console.log(e.key);
    }
  }

  KaiRouter.prototype.addKeydownListener = function() {
    document.activeElement.addEventListener('keydown', this.handleKeydown);
  }

  KaiRouter.prototype.removeKeydownListener = function() {
    document.activeElement.removeEventListener('keydown', this.handleKeydown);
  }

  return KaiRouter;

})();
