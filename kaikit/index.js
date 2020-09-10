const Kai = (function() {

  function Kai(options) {
    this.init(options);
  }

  Kai.prototype.init = function(options) {

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
    this.softkey = { left: {}, center: {}, right: {} };
    this._router;
    this._state;
    this._options;
    this._data;

    this._Kai = function (options) {
      this._options = options;
      this._data = JSON.stringify(options.data);
      const public = ['id','name', 'data', 'template' , 'templateUrl', 'mustache', 'methods', 'mounted', 'unmounted', 'router', 'state', 'softkey'];
      for (var i in options) {
        if (public.indexOf(i) !== -1) { // allow override
          if (i === 'methods') {
            for (f in options[i]) {
              if (typeof options[i][f] === 'function') {
                this[i][f] = options[i][f].bind(this);
              }
            }
          } else if (i === 'softkey') {
            for (f in options[i]) {
              this.softkey[f] = options[i][f];
              for (g in options[i][f]) {
                if (typeof options[i][f][g] === 'function') {
                  this[i][f][g] = options[i][f][g].bind(this);
                }
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
      console.log('unmounted previous:', vdom.__kaikit__.name);
      if (vdom.__kaikit__._router) {
        vdom.__kaikit__._router.removeKeydownListener();
      }
      vdom.__kaikit__.unmounted();
      vdom.__kaikit__.isMounted = false;
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
      this.mounted();
      this.exec();
    } else {
      const xhttp = new XMLHttpRequest({ mozSystem: true });
      xhttp.onreadystatechange = (evt) => {
        if (evt.target.readyState == 4 && evt.target.status == 200) {
          this.template = xhttp.responseText;
          this.mounted();
          this.exec();
        }
      };
      // console.log(this.templateUrl);
      xhttp.open('GET', this.templateUrl, true);
      xhttp.send();
    }
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
    if (this._router && this.isMounted) {
      // console.log(vdom, this.isMounted);
    }
    if (this.mustache) {
      const data = JSON.parse(JSON.stringify(this.data));
      if (this.$state) {
        data.$state = JSON.parse(JSON.stringify(this.$state.getState()));
      }
      vdom.innerHTML = Mustache.render(this.template, data);
    } else {
      // console.log(this.template);
      vdom.innerHTML = this.template;
    }
    this.isMounted = true;
    // console.log(this.id, vdom);
  }

  Kai.prototype.setData = function(data) {
    this.data = Object.assign(JSON.parse(JSON.stringify(this.data)), data); // immutability
    this.exec();
  }

  Kai.prototype.handleClick = function(evt) {
    evt.stopImmediatePropagation();
    var _this = this.__kaikit__;
    var extractFuncRegex = /\b[^()]+\((.*)\)$/;
    const target = evt.target.attributes.getNamedItem('kai:click');
    if (evt.target.attributes.length > 0 && target) {
      if (target.nodeValue !== '') {
        const params = target.nodeValue.split(';');
        params.forEach(function(v) {
          var fName = v.substring(0, v.indexOf('('));
          var fParams = null
          if (v.search(extractFuncRegex) !== -1) {
            var _fParams = v.substring((v.indexOf('(') +1), v.indexOf(')')).split(',');
            fParams = _fParams.length === 1 && _fParams[0] === '' ? null : _fParams;
          }
          if (_this.methods[fName]) {
            _this.methods[fName].apply(null, fParams);
          }
        });
      }
    }
  }

  Kai.prototype.reset = function() {
    this.data = JSON.parse(this._data);
    return this;
  }

  return Kai;

})()

