window.addEventListener("load", function() {

  const state = new KaiState({'counter': -1});

  const createSubComponent = function(id) {
    return new Kai({
      id: id,
      name: '_createsubcomponent_',
      disableKeyListener: true,
      data: {
        title: '_createsubcomponent_',
        counter: -1,
      },
      template: '<button class="kui-btn">{{ counter }} {{ $state.counter }}</button>',
      mounted: function() {},
      unmounted: function() {},
      methods: {
        minus: function() {
          this.setData({ counter: this.data.counter - 1 });
        },
        reset: function() {
          this.setData({ counter: 0 });
        },
        plus: function() {
          this.setData({ counter: this.data.counter + 1 });
        },
      }
    });
  }

  const subcomponent = new Kai({
    name: '_subcomponent_',
    disableKeyListener: true,
    data: {
      title: '_subcomponent_',
      counter: -1,
    },
    template: '<button class="kui-btn">{{ counter }} {{ $state.counter }}</button>',
    mounted: function() {},
    unmounted: function() {},
    methods: {
      minus: function() {
        this.setData({ counter: this.data.counter - 1 });
      },
      reset: function() {
        this.setData({ counter: 0 });
      },
      plus: function() {
        this.setData({ counter: this.data.counter + 1 });
      },
    }
  });

  const firstTab = new Kai({
    name: '_firstTab_',
    data: {
      title: '_firstTab_',
      subcomponentIds: [],
    },
    components: [subcomponent],
    verticalNavClass: '.firstTabNav',
    templateUrl: document.location.origin + '/templates/tabs/firstTab.html',
    mounted: function() {
      this.setData({ subcomponentIds: ['sc1', 'sc2'] });
      this.data.subcomponentIds.forEach((id) => {
        const c = this.components[0].clone();
        c.id = id;
        this.components.push(c);
      });
      this.render();
    },
    unmounted: function() {},
    methods: {},
    softKeyListener: {
      left: {
        text: 'L1',
        func: function() {}
      },
      center: {
        text: 'C1',
        func: function() {
          if (this.verticalNavIndex > -1) {
            const nav = document.querySelectorAll(this.verticalNavClass);
            nav[this.verticalNavIndex].click();
          }
        }
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
    verticalNavClass: '.secondTabNav',
    templateUrl: document.location.origin + '/templates/tabs/secondTab.html',
    mounted: function() {},
    unmounted: function() {},
    methods: {},
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
    verticalNavClass: '.thirdTabNav',
    templateUrl: document.location.origin + '/templates/tabs/thirdTab.html',
    mounted: function() {},
    unmounted: function() {},
    methods: {},
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
    verticalNavClass: '.fourthTabNav',
    templateUrl: document.location.origin + '/templates/tabs/fourthTab.html',
    mounted: function() {},
    unmounted: function() {},
    methods: {},
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
    verticalNavClass: '.fifthTabNav',
    templateUrl: document.location.origin + '/templates/tabs/fifthTab.html',
    mounted: function() {},
    unmounted: function() {},
    methods: {},
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

  const sixthTab = `KaiOS is a web-based mobile operating system that enables a new category of smart feature phones. It is forked from B2G (Boot to Gecko), a successor of the discontinued Firefox OS.
KaiOS brings support of 4G/LTE, GPS, and Wi-Fi, as well as HTML5-based apps and longer battery life, to non-touch devices. It has an optimized user interface for smart feature phones, needs little memory, and consumes less energy than other operating systems. It also comes with the KaiStore, which enables users to download applications in categories like social media, games, navigation, and streaming entertainment.`;

  const seventhTab = new Kai({
    name: '_seventhTab_',
    data: {
      title: '_seventhTab_'
    },
    template: sixthTab,
    mounted: function() {},
    unmounted: function() {},
    methods: {},
    softKeyListener: {
      left: {
        text: 'Push',
        func: function() {
          this.$router.push('third');
        }
      },
      center: {
        text: '',
        func: function() {}
      },
      right: {
        text: 'Pop',
        func: function() {
          this.$router.pop();
        }
      }
    }
  });

  const eighthTab = new Kai({
    name: '_eighthTab_',
    data: {
      title: '_eighthTab_',
      counter: -1,
    },
    verticalNavClass: '.eighthTabNav',
    templateUrl: document.location.origin + '/templates/tabs/eighthTab.html',
    mounted: function() {},
    unmounted: function() {},
    methods: {
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
          if (this.verticalNavIndex > -1) {
            const nav = document.querySelectorAll(this.verticalNavClass);
            nav[this.verticalNavIndex].click();
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

  const lastChild = new Kai({
    name: '_LASTCHILD_',
    data: {
      title: '_LASTCHILD_',
      counter: -1,
    },
    state,
    verticalNavClass: '.lastChildNav',
    templateUrl: document.location.origin + '/templates/lastchild.html',
    mounted: function() {
      this.$state.addStateListener('counter', this.methods.listenState);
    },
    unmounted: function() {
      this.$state.removeStateListener('counter', this.methods.listenState);
    },
    methods: {
      listenState: function(data) {
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
          if (this.verticalNavIndex > -1) {
            const nav = document.querySelectorAll(this.verticalNavClass);
            nav[this.verticalNavIndex].click();
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
      selected: 'None',
      subcomponentIds: [],
      opts: [
        { "text": "PHP", "checked": true },
        { "text": "JavaScript", "checked": false },
        { "text": "Dart", "checked": false },
        { "text": "Golang", "checked": false },
        { "text": "SQL", "checked": false },
        { "text": "Java", "checked": false },
        { "text": "CSS", "checked": false },
        { "text": "HTML", "checked": false },
        { "text": "Flutter", "checked": false },
        { "text": "React Native", "checked": false }
      ]
    },
    verticalNavClass: '.child1Nav',
    components: [subcomponent],
    templateUrl: document.location.origin + '/templates/child_1.html',
    mounted: function() {
      this.$state.addStateListener('counter', this.methods.listenState);
      this.setData({ subcomponentIds: ['sc1', 'sc2'] });
      this.data.subcomponentIds.forEach((id) => {
        const c = this.components[0].clone();
        c.id = id;
        this.components.push(c);
      });
      this.render();
    },
    unmounted: function() {
      this.$state.removeStateListener('counter', this.methods.listenState);
    },
    methods: {
      listenState: function(data) {
        this.render()
      },
      selected: function(val) {
        this.setData({ selected: val.text });
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
      testOptMenu: function() {
        const idx = this.data.opts.findIndex((opt) => {
          return opt.text === this.data.selected;
        });
        this.$router.showOptionMenu('Option', this.data.opts, 'Select', (selected) => {
          this.setData({ selected: selected.text });
        }, idx);
      },
      testSingleSelector: function() {
        const idx = this.data.opts.findIndex((opt) => {
          return opt.text === this.data.selected;
        });
        this.$router.showSingleSelector('Select', this.data.opts, 'Select', (selected) => {
          this.setData({ selected: selected.text });
        }, 'Cancel', null, idx);
      },
      testMultiSelector: function() {
        const idx = this.data.opts.findIndex((opt) => {
          return opt.text === this.data.selected;
        });
        this.$router.showMultiSelector('Select', this.data.opts, 'Select', null, 'Save', (options) => {
          this.setData({ opts: options });
        }, 'Cancel', null, 0);
      },
      testDatePicker: function() {
        this.$router.showDatePicker(null, null, null, (dt) => {
          this.setData({ title: dt.toLocaleDateString() });
        });
      },
      testTimePicker: function() {
        this.$router.showTimePicker(null, null, null, (dt) => {
          this.setData({ title: dt.toLocaleTimeString() });
        });
      },
      testToast: function() {
        this.$router.showToast('This is test toast');
      },
      testLocalNotification: function() {
        window.Notification.requestPermission().then(function(result) {
          var notification = new window.Notification("Test local notification");
            notification.onclick = function(event) {
              if (window.navigator.mozApps) {
                var request = window.navigator.mozApps.getSelf();
                request.onsuccess = function() {
                  if (request.result) {
                    notification.close();
                    request.result.launch();
                  }
                };
              } else {
                window.open(document.location.origin, '_blank');
              }
            }
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
          const listNav = document.querySelectorAll(this.verticalNavClass);
          if (this.verticalNavIndex > -1) {
            listNav[this.verticalNavIndex].click();
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
        // this.navigateTabNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      },
      arrowLeft: function() {
        // this.navigateTabNav(1);
      },
    },
    backKeyListener: function() {
      console.log(this.name, 'backKeyListener');
    }
  });

  const secondChild = Kai.createTabNav('_CHILD_ 2', '.child2DemoNav', [firstTab, secondTab, thirdTab, fourthTab, fifthTab, seventhTab, eighthTab]);

  const thirdChild = new Kai({
    name: '_CHILD_ 3',
    data: {
      title: '_CHILD_ 3',
      counter: -1,
    },
    verticalNavClass: '.child2Nav',
    templateUrl: document.location.origin + '/templates/child_3.html',
    mounted: function() {
      this.$state.addStateListener('counter', this.methods.listenState);
      this.components = [createSubComponent('subcomponent0'), createSubComponent('subcomponent1')];
      this.render();
    },
    unmounted: function() {
      this.$state.removeStateListener('counter', this.methods.listenState);
    },
    methods: {
      listenState: function(data) {
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
          this.$router.push(lastChild);
        }
      },
      center: {
        text: 'SELECT',
        func: function() {
          if (this.verticalNavIndex > -1) {
            const nav = document.querySelectorAll(this.verticalNavClass);
            nav[this.verticalNavIndex].click();
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
    title: 'KaiKit',
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
    data: {},
    templateUrl: document.location.origin + '/templates/template.html',
    mounted: function() {},
    unmounted: function() {},
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
