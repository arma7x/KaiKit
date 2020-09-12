const Kai = (function() {

  function Kai(options) {
    this.init(options);
  }

  Kai.prototype.init = function(options) {

    const _this = this;
    this.id;
    this.name = 'Kai';
    this.data;
    this.template = '';
    this.templateUrl;
    this.methods = {};
    this.isMounted = false;
    this.mustache;
    this.$router;
    this.$state;
    this.softKeyListener = { left: {}, center: {}, right: {} };
    this.scrollThreshold = 0;
    this.listNavClass = '.kai-list-nav';
    this.listNavIndex = -1;
    this.dPadNavListener = {
      arrowUp: function() {
        const vdom = document.getElementById(_this.id);
        vdom.scrollTop -= 20;
        _this.scrollThreshold = vdom.scrollTop;
      },
      arrowRight: function() {
        const vdom = document.getElementById(_this.id);
        vdom.scrollLeft = +20;
      },
      arrowDown: function() {
        const vdom = document.getElementById(_this.id);
        vdom.scrollTop += 20;
        _this.scrollThreshold = vdom.scrollTop;
      },
      arrowLeft: function() {
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
      const public = ['id','name', 'data', 'template' , 'templateUrl', 'mustache', 'methods', 'mounted', 'unmounted', 'router', 'state', 'softKeyListener', 'dPadNavListener', 'listNavClass'];
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
          } else if (i === 'mustache' && options[i] === Mustache.__proto__) {
            this[i] = options[i];
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
    if ((vdom.__kaikit__ !== undefined || vdom.__kaikit__ !== null) && vdom.__kaikit__ instanceof Kai && this.id !== '__kai_router__') {
      console.log('unmount previous:', vdom.__kaikit__.name);
      if (vdom.__kaikit__._router) {
        vdom.__kaikit__._router.removeKeydownListener();
      }
      vdom.__kaikit__.unmount();
      vdom.removeEventListener('click', this.handleClick);
    }
    vdom.__kaikit__ = this;
    vdom.addEventListener('click', this.handleClick);

    if (this.isMounted) {
      this.render();
      // console.log('RE-RENDER', this.name, this.isMounted);
      return;
    }
    // console.log('mounting:', this.name);
    if (!this.templateUrl) {
      if (this.mustache) {
        this.mustache.parse(this.template);
      }
      this.exec();
      this.mounted();
    } else {
      const xhttp = new XMLHttpRequest({ mozSystem: true });
      xhttp.onreadystatechange = (evt) => {
        if (evt.target.readyState == 4 && evt.target.status == 200) {
          this.template = xhttp.responseText;
          if (this.mustache) {
            this.mustache.parse(this.template);
          }
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
    this.scrollThreshold = 0;
    this.listNavIndex = -1;
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
    if (this.mustache) {
      const data = JSON.parse(JSON.stringify(this.data));
      if (this.$state) {
        data.$state = JSON.parse(JSON.stringify(this.$state.getState()));
      }
      vdom.innerHTML = this.mustache.render(this.template, data);
    } else {
      // console.log(this.template);
      vdom.innerHTML = this.template;
    }
    const nav = document.querySelectorAll(this.listNavClass);
    if (nav.length > 0 && this.id !== '__kai_header__' && this.id !==  '__kai_soft_key__') {
      if (this.listNavIndex === -1) {
        this.listNavIndex = 0;
      }
      nav[this.listNavIndex].focus();
    }
    this.isMounted = true;
    // console.log(this.id, vdom);
  }

  Kai.prototype.setData = function(data) {
    this.data = Object.assign(JSON.parse(JSON.stringify(this.data)), data); // immutability
    this.exec();
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

  Kai.prototype.nav = function(next, selector) {
    const currentIndex = this.listNavIndex;
    const nav = document.querySelectorAll(this.listNavClass);
    var move = currentIndex + next;
    var targetElement = nav[move];
    if (targetElement !== undefined) {
      targetElement.focus();
      this.listNavIndex = move;
    } else {
      if (move < 0) {
        move = nav.length - 1;
      } else if (move >= nav.length) {
        move = 0;
      }
      targetElement = nav[move];
      targetElement.focus();
      this.listNavIndex = move;
    }
  }

  return Kai;

})()

