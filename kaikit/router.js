const KaiRouter = (function() {

  function KaiRouter(options) {
    this.init(options);
  }

  KaiRouter.prototype.init = function(options) {

    this._404 = new Kai({
      template: '404',
      softkey: {
        left: {
          text: 'L 404'
        },
        center: {
          text: 'C 404'
        },
        right: {
          text: 'R 404'
        }
      }
    });
    this.title = '';
    this.routes = {};
    this.stack = [];
    this.header;
    this.softwareKey;

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

  KaiRouter.prototype.run = function() {
    this.renderHeader();
    this.renderSoftKey();
    this.calcBodyHeight();
    var pathname = window.location.pathname.replace(/\/$/, '');
    if (pathname.length === 0) {
      pathname = '/index.html';
    }
    window.history.pushState("/", "", pathname);
    const paths = pathname.split('/');
    paths.shift();
    paths.forEach((path, k) => {
      if (k === (paths.length - 1)) {
        if (this.routes[path]) {
          const component = this.routes[path].component;
          if (component.isMounted === false) {
            this.stack.push(component);
          }
          // component.$router = this;
          component.mount('__kai_router__');
          this.setLeftText(component.softkey.left.text);
          this.setCenterText(component.softkey.center.text);
          this.setRightText(component.softkey.center.text);
          this.addKeydownListener();
        } else {
          this._404.mount('__kai_router__');
          this._404.$router = this;
          this.setLeftText(this._404.softkey.left.text);
          this.setCenterText(this._404.softkey.center.text);
          this.setRightText(this._404.softkey.right.text);
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
          this.setLeftText(this._404.softkey.left.text);
          this.setCenterText(this._404.softkey.center.text);
          this.setRightText(this._404.softkey.right.text);
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
    var name = path;
    if (typeof path === 'string' && this.routes[path]) {
      const clone = this.routes[path].component.reset();
      // clone.$router = this;
      clone.mount('__kai_router__');
      this.setLeftText(clone.softkey.left.text);
      this.setCenterText(clone.softkey.center.text);
      this.setRightText(clone.softkey.center.text);
      this.stack.push(clone);
    } else if (path instanceof Kai) {
      const clone = path.reset();
      clone.$router = this;
      clone.mount('__kai_router__');
      this.setLeftText(clone.softkey.left.text);
      this.setCenterText(clone.softkey.center.text);
      this.setRightText(clone.softkey.center.text);
      this.stack.push(clone);
      name = clone.name;
    } else {
      this._404.mount('__kai_router__');
      this._404.$router = this;
      this.setLeftText(this._404.softkey.left.text);
      this.setCenterText(this._404.softkey.center.text);
      this.setRightText(this._404.softkey.right.text);
      this.stack.push(this._404);
    }
    var pathname = window.location.pathname.replace(/\/$/, '');
    window.history.pushState("/", "", pathname + '/' + name);
  }

  KaiRouter.prototype.pop = function() {
    var pathname = window.location.pathname.replace(/\/$/, '');
    var paths = pathname.split('/');
    if ((paths.length - 1) > 0 && this.stack.length > 0 && ((paths.length - 1) === this.stack.length)) {
      var r = false;
      if ((this.stack.length - 1) > 0) {
        paths.pop();
        this.stack.pop();
        const vdom = document.getElementById('__kai_router__');
        if (vdom) {
          if (vdom.__kaikit__ != undefined && vdom.__kaikit__ instanceof Kai && vdom.__kaikit__.id === '__kai_router__') {
            console.log('unmounted previous:', vdom.__kaikit__.name);
            vdom.__kaikit__.unmounted();
            vdom.__kaikit__.isMounted = false;
            vdom.removeEventListener('click', vdom.__kaikit__.handleClick);
          }
        }
        const component = this.stack[this.stack.length - 1];
        component.mount('__kai_router__');
        this.setLeftText(component.softkey.left.text);
        this.setCenterText(component.softkey.center.text);
        this.setRightText(component.softkey.center.text);
        r = true;
      }
      window.history.pushState("/", "", paths.join('/').length === 0 ? '/' : paths.join('/'));
      return r;
    } else {
      return false;
    }
    return false;
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
        template: '<span id="__kai_header_title__" style="margin-left: 8px;">{{ title }}</span>',
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
        template: '<div kai:click="clickLeft()" style="width:32%;text-align:left;padding-left:5px;">{{ left }}</div><div kai:click="clickCenter()" style="width:36%;text-align:center;">{{ center }}</div><div kai:click="clickRight()" style="width:32%;text-align:right;padding-right:5px;">{{ right }}</div>',
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
    this.stack[this.stack.length - 1].softkey.left.func();
  }

  KaiRouter.prototype.clickCenter = function() {
    this.stack[this.stack.length - 1].softkey.center.func();
  }

  KaiRouter.prototype.clickRight = function() {
    this.stack[this.stack.length - 1].softkey.right.func();
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
        } else {
          if (_router) {
            if (_router.pop()) {
              e.preventDefault();
              e.stopPropagation();
            } else {
              console.log('ROOT');
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
