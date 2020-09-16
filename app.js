window.addEventListener("load", function() {

  const sixthTab = `KaiOS is a web-based mobile operating system that enables a new category of smart feature phones. It is forked from B2G (Boot to Gecko), a successor of the discontinued Firefox OS.
KaiOS brings support of 4G/LTE, GPS, and Wi-Fi, as well as HTML5-based apps and longer battery life, to non-touch devices. It has an optimized user interface for smart feature phones, needs little memory, and consumes less energy than other operating systems. It also comes with the KaiStore, which enables users to download applications in categories like social media, games, navigation, and streaming entertainment.`;

  const state = new KaiState({'counter': -1});

  const firstTab = new Kai({
    name: '_firstTab_',
    data: {
      title: '_firstTab_'
    },
    state,
    listNavClass: '.firstTabNav',
    templateUrl: document.location.origin + '/templates/tabs/firstTab.html',
    mounted: function() {
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
    },
    methods: {
    },
    softKeyListener: {
      left: {
        text: 'L1',
        func: function() {}
      },
      center: {
        text: 'C1',
        func: function() {}
      },
      right: {
        text: 'R1',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      }
    }
  });

  const secondTab = new Kai({
    name: '_secondTab_',
    data: {
      title: '_secondTab_'
    },
    state,
    listNavClass: '.secondTabNav',
    templateUrl: document.location.origin + '/templates/tabs/secondTab.html',
    mounted: function() {
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
    },
    methods: {
    },
    softKeyListener: {
      left: {
        text: 'L2',
        func: function() {}
      },
      center: {
        text: 'C2',
        func: function() {}
      },
      right: {
        text: 'R2',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      }
    }
  });

  const thirdTab = new Kai({
    name: '_thirdTab_',
    data: {
      title: '_thirdTab_'
    },
    state,
    listNavClass: '.thirdTabNav',
    templateUrl: document.location.origin + '/templates/tabs/thirdTab.html',
    mounted: function() {
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
    },
    methods: {
    },
    softKeyListener: {
      left: {
        text: 'L3',
        func: function() {}
      },
      center: {
        text: 'C3',
        func: function() {}
      },
      right: {
        text: 'R3',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      }
    }
  });

  const fourthTab = new Kai({
    name: '_fourthTab_',
    data: {
      title: '_fourthTab_'
    },
    state,
    listNavClass: '.fourthTabNav',
    templateUrl: document.location.origin + '/templates/tabs/fourthTab.html',
    mounted: function() {
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
    },
    methods: {
    },
    softKeyListener: {
      left: {
        text: 'L4',
        func: function() {}
      },
      center: {
        text: 'C4',
        func: function() {}
      },
      right: {
        text: 'R4',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      }
    }
  });

  const fifthTab = new Kai({
    name: '_fifthTab_',
    data: {
      title: '_fifthTab_'
    },
    state,
    listNavClass: '.fifthTabNav',
    templateUrl: document.location.origin + '/templates/tabs/fifthTab.html',
    mounted: function() {
    },
    unmounted: function() {
      // console.log('unmounted:', this.name);
    },
    methods: {
    },
    softKeyListener: {
      left: {
        text: 'L5',
        func: function() {}
      },
      center: {
        text: 'C5',
        func: function() {}
      },
      right: {
        text: 'R5',
        func: function() {}
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      }
    }
  });

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
        console.log('LISTEN', this.name, data);
        this.render()
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
        text: 'Push',
        func: function() {
          this.$router.push('404');
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
        text: 'Pop',
        func: function() {
          this.$router.pop();
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowRight: function() {
        this.navigateTabNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      },
      arrowLeft: function() {
        this.navigateTabNav(1);
      },
    }
  });

  const firstChild = new Kai({
    name: '_CHILD_ 1',
    data: {
      title: '_CHILD_ 1',
      counter: -1,
      selected: 'None'
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
        console.log('LISTEN', this.name, data);
        this.render()
      },
      push: function() {
        this.$router.push('second');
      },
      minus: function() {
        this.setData({ counter: this.data.counter - 1 });
        this.$state.setState('counter', this.$state.getState('counter') - 1);
      },
      reset: function() {
        this.$router.showDialog('Decrement', 'Are sure to reset the counter ?', this.data, 'Yes', () => {
          this.setData({ counter: 0 });
          this.$state.setState('counter', 0);
        }, 'Cancel', undefined);
      },
      plus: function() {
        this.setData({ counter: this.data.counter + 1 });
        this.$state.setState('counter', this.$state.getState('counter') + 1);
      },
      showOptMenu: function() {
        var opts = [
          { "name": "PHP" },
          { "name": "JavaScript" },
          { "name": "Dart" },
          { "name": "Golang" },
          { "name": "SQL" },
          { "name": "Java" },
          { "name": "CSS" },
          { "name": "HTML" },
          { "name": "Flutter" },
          { "name": "React Native" }
        ];
        this.$router.showOptionMenu('Option', opts, 'Select', (selected) => {
          this.setData({ selected: selected.name });
        });
      }
    },
    softKeyListener: {
      left: {
        text: 'Minus',
        func: function() {
          this.$router.showDialog('Decrement', 'Are sure to minus -1 from counter ?', this.data, 'Yes', this.methods.minus, 'Cancel', undefined);
        }
      },
      center: {
        text: 'SELECT',
        func: function() {
          const listNav = document.querySelectorAll(this.listNavClass);
          if (this.listNavIndex > -1) {
            listNav[this.listNavIndex].click();
          }
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
        this.navigateListNav(-1);
      },
      arrowRight: function() {
        this.navigateTabNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      },
      arrowLeft: function() {
        this.navigateTabNav(1);
      },
    }
  });

  const secondChild = Kai.createTabNav('_CHILD_ 2', '.child2DemoNav', [
    {name: 'firstTab', component: firstTab},
    {name: 'secondTab', component: secondTab},
    {name: 'thirdTab', component: thirdTab},
    {name: 'fourthTab', component: fourthTab},
    {name: 'fifthTab', component: fifthTab},
    {name: 'sixthTab', component: sixthTab},
    {name: 'lastChild', component: lastChild}
  ]);

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
        console.log('LISTEN', this.name, data);
        this.render()
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
        text: 'Push',
        func: function() {
          this.$router.push(lastChild);
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
        text: 'Pop',
        func: function() {
          this.$router.pop();
        }
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowRight: function() {
        this.navigateTabNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      },
      arrowLeft: function() {
        this.navigateTabNav(1);
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
    name: '_APP_',
    data: {
      counter: -1,
    },
    templateUrl: document.location.origin + '/template.html',
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
      //secondChild.mount('app');
    //}, 2000);
  } catch(e) {
    console.log(e);
  }
});
