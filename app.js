window.addEventListener("load", function() {

  const state = new KaiState({'counter': -1});

  const lastChild = new Kai({
    name: '_LASTCHILD_',
    data: {
      title: '_LASTCHILD_',
      counter: -1,
    },
    state,
    listNavClass: '.lastChildNav',
    templateUrl: document.location.origin + '/templates/lastchild.html',
    mounted: function() {
      // console.log('mounted:', this.name);
      this.$state.addStateListener('counter', this.methods.listenState);
      // console.log('STATE', this.name, this.$state.getState('counter'));
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
      this.$state.removeStateListener('counter', this.methods.listenState);
    },
    methods: {
      listenState: function(data) {
        // console.log('LISTEN', this.name, data);
        this.render()
      },
      push: function() {
        this.$router.push('404');
      },
      pop: function() {
        this.$router.pop();
      },
      selectNav: function(name) {
        console.log(name);
      },
      minus: function() {
        this.setData({ counter: this.data.counter - 1 });
        this.$state.setState('counter', this.$state.getState('counter') - 1);
      },
      reset: function() {
        this.setData({ counter: 0 });
        this.$state.setState('counter', 0);
      },
      plus: function() {
        this.setData({ counter: this.data.counter + 1 });
        this.$state.setState('counter', this.$state.getState('counter') + 1);
      },
    },
    softKeyListener: {
      left: {
        text: '-1',
        func: function() {
          this.methods.minus();
        }
      },
      center: {
        text: 'SELECT',
        func: function() {
          if (this.listNavIndex > -1) {
            const nav = document.querySelectorAll(this.listNavClass);
            nav[this.listNavIndex].click();
          }
        }
      },
      right: {
        text: '+1',
        func: function() {
          this.methods.plus();
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.nav(-1);
      },
      arrowRight: function() {
        console.log('arrowRight');
      },
      arrowDown: function() {
        this.nav(1);
      },
      arrowLeft: function() {
        console.log('arrowLeft');
      },
    }
  });

  const firstChild = new Kai({
    name: '_CHILD_ 1',
    data: {
      title: '_CHILD_ 1',
      counter: -1,
    },
    listNavClass: '.child1Nav',
    templateUrl: document.location.origin + '/templates/child_1.html',
    mounted: function() {
      // console.log('mounted:', this.name);
      this.$state.addStateListener('counter', this.methods.listenState);
      // console.log('STATE', this.name, this.$state.getState('counter'));
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
      this.$state.removeStateListener('counter', this.methods.listenState);
    },
    methods: {
      listenState: function(data) {
        // console.log('LISTEN', this.name, data);
        this.render()
      },
      push: function() {
        this.$router.push('second');
      },
      pop: function() {
        this.$router.pop();
      },
      selectNav: function(name) {
        console.log(name);
      },
      minus: function() {
        this.setData({ counter: this.data.counter - 1 });
        this.$state.setState('counter', this.$state.getState('counter') - 1);
      },
      reset: function() {
        this.setData({ counter: 0 });
        this.$state.setState('counter', 0);
      },
      plus: function() {
        this.setData({ counter: this.data.counter + 1 });
        this.$state.setState('counter', this.$state.getState('counter') + 1);
      },
    },
    softKeyListener: {
      left: {
        text: 'Minus',
        func: function() {
          this.$router.showDialog('Decrement', 'Are sure to minus -1 from counter ?', this.data, 'Yes', this.methods.minus, 'Cancel', undefined);
        }
      },
      center: {
        text: 'Reset',
        func: function() {
          this.$router.showDialog('Decrement', 'Are sure to reset the counter ?', this.data, 'Yes', this.methods.reset, 'Cancel', undefined);
        }
      },
      right: {
        text: 'Plus',
        func: function() {
          this.$router.showDialog('Increment', 'Are sure to add +1 into counter ?', this.data, 'Yes', this.methods.plus, 'Cancel', undefined);
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.nav(-1);
      },
      arrowRight: function() {
        console.log('arrowRight');
      },
      arrowDown: function() {
        this.nav(1);
      },
      arrowLeft: function() {
        console.log('arrowLeft');
      },
    }
  });

  const secondChild = new Kai({
    name: '_CHILD_ 2',
    data: {
      title: '_CHILD_ 2',
      counter: -1,
    },
    templateUrl: document.location.origin + '/templates/child_2.html',
    mounted: function() {
      // console.log('mounted:', this.name);
      this.$state.addStateListener('counter', this.methods.listenState);
      // console.log('STATE', this.name, this.$state.getState('counter'));
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
      this.$state.removeStateListener('counter', this.methods.listenState);
    },
    methods: {
      listenState: function(data) {
        // console.log('LISTEN', this.name, data);
        this.render()
      },
      push: function() {
        this.$router.push('third');
      },
      pop: function() {
        this.$router.pop();
      }
    },
    softKeyListener: {
      left: {
        text: '-1',
        func: function() {
          this.setData({ counter: this.data.counter - 1 });
          this.$state.setState('counter', this.$state.getState('counter') - 1);
        }
      },
      center: {
        text: '0',
        func: function() {
          this.setData({ counter: 0 });
          this.$state.setState('counter', 0);
        }
      },
      right: {
        text: '+1',
        func: function() {
          this.setData({ counter: this.data.counter + 1 });
          this.$state.setState('counter', this.$state.getState('counter') + 1);
        }
      }
    }
  });

  const thirdChild = new Kai({
    name: '_CHILD_ 3',
    data: {
      title: '_CHILD_ 3',
      counter: -1,
    },
    listNavClass: '.child2Nav',
    templateUrl: document.location.origin + '/templates/child_3.html',
    mounted: function() {
      // console.log('mounted:', this.name);
      this.$state.addStateListener('counter', this.methods.listenState);
      // console.log('STATE', this.name, this.$state.getState('counter'));
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
      this.$state.removeStateListener('counter', this.methods.listenState);
    },
    methods: {
      listenState: function(data) {
        // console.log('LISTEN', this.name, data);
        this.render()
      },
      push: function() {
        this.$router.push(lastChild);
      },
      pop: function() {
        this.$router.pop();
      },
      selectNav: function(name) {
        console.log(name);
      },
      minus: function() {
        this.setData({ counter: this.data.counter - 1 });
        this.$state.setState('counter', this.$state.getState('counter') - 1);
      },
      reset: function() {
        this.setData({ counter: 0 });
        this.$state.setState('counter', 0);
      },
      plus: function() {
        this.setData({ counter: this.data.counter + 1 });
        this.$state.setState('counter', this.$state.getState('counter') + 1);
      },
    },
    softKeyListener: {
      left: {
        text: '-1',
        func: function() {
          this.methods.minus();
        }
      },
      center: {
        text: 'SELECT',
        func: function() {
          if (this.listNavIndex > -1) {
            const nav = document.querySelectorAll(this.listNavClass);
            nav[this.listNavIndex].click();
          }
        }
      },
      right: {
        text: '+1',
        func: function() {
          this.methods.plus();
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.nav(-1);
      },
      arrowRight: function() {
        console.log('arrowRight');
      },
      arrowDown: function() {
        this.nav(1);
      },
      arrowLeft: function() {
        console.log('arrowLeft');
      },
    }
  });

  const router = new KaiRouter({
    title: 'Kai',
    routes: {
      'index' : {
        name: 'firstChild',
        component: firstChild
      },
      'second' : {
        name: 'secondChild',
        component: secondChild
      },
      'third' : {
        name: 'thirdChild',
        component: thirdChild
      },
    }
  });

  const app = new Kai({
    name: '_BASE_',
    data: {
      counter: -1,
    },
    templateUrl: document.location.origin + '/templateRouter.html',
    mounted: function() {
      // console.log('mounted:', this.name);
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
    },
    methods: {
      test: function() {
        this.setData({ counter: this.data.counter + 1 });
      }
    },
    router,
    state
  });
  try {
    app.mount('app');
    //setTimeout(function() {
      //firstChild.mount('app');
    //}, 2000);
  } catch(e) {
    console.log(e);
  }
});
