window.addEventListener("load", function() {

  const state = new KaiState({
    'counter': -1,
    'editor': '',
  });

  const subcomponent = Kai.createComponent({
    name: '_subcomponent_',
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

  const createSubComponent = function(id) {
    const clone = subcomponent.clone();
    clone.id = id;
    return clone;
  }

  const firstTab = new Kai({
    name: '_firstTab_',
    data: {
      title: '_firstTab_',
      subcomponentIds: [],
    },
    components: [],
    verticalNavClass: '.firstTabNav',
    templateUrl: document.location.origin + '/templates/tabs/firstTab.html',
    mounted: function() {
      this.setData({ subcomponentIds: ['sc1', 'sc2'] });
      if (this.components.length === 0) {
        this.data.subcomponentIds.forEach((id) => {
          const c = subcomponent.clone();
          c.id = id;
          this.components.push(c);
        });
        this.render();
      }
    },
    unmounted: function() {},
    methods: {},
    softKeyText: { left: 'L1', center: 'C1', right: 'R1' },
    softKeyListener: {
      left: function() {},
      center: function() {
        if (this.verticalNavIndex > -1) {
          const nav = document.querySelectorAll(this.verticalNavClass);
          nav[this.verticalNavIndex].click();
        }
      },
      right: function() {}
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
    softKeyText: { left: 'L2', center: 'C2', right: 'R2' },
    softKeyListener: {
      left: function() {},
      center: function() {},
      right: function() {}
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
    softKeyText: { left: 'L3', center: 'C3', right: 'R3' },
    softKeyListener: {
      left: function() {},
      center: function() {},
      right: function() {}
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
    softKeyText: { left: 'L4', center: 'C4', right: 'R4' },
    softKeyListener: {
      left: function() {},
      center: function() {},
      right: function() {}
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
    softKeyText: { left: 'L5', center: 'C5', right: 'R5' },
    softKeyListener: {
      left: function() {},
      center: function() {},
      right: function() {}
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
    softKeyText: { left: 'PUSH', center: '', right: 'POP' },
    softKeyListener: {
      left: function() {
        this.$router.push('third');
      },
      center: function() {},
      right: function() {
        this.$router.pop();
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
    softKeyText: { left: 'PUSH', center: 'SELECT', right: 'POP' },
    softKeyListener: {
      left: function() {
        this.$router.push('404');
      },
      center: function() {
        if (this.verticalNavIndex > -1) {
          const nav = document.querySelectorAll(this.verticalNavClass);
          nav[this.verticalNavIndex].click();
        }
      },
      right: function() {
        this.$router.pop();
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
    softKeyText: { left: 'POP', center: 'SELECT', right: 'POP' },
    softKeyListener: {
      left: function() {
        this.$router.push('404');
      },
      center: function() {
        if (this.verticalNavIndex > -1) {
          const nav = document.querySelectorAll(this.verticalNavClass);
          nav[this.verticalNavIndex].click();
        }
      },
      right: function() {
        this.$router.pop();
      }
    },
    softKeyInputFocusText: { left: 'Copy', center: 'Paste', right: 'Cut' },
    softKeyInputFocusListener: {
      left: function() {
        if (document.activeElement.tagName === 'INPUT') {
          if (document.activeElement.value && document.activeElement.value.length > 0) {
            this.$state.setState('editor', document.activeElement.value);
          }
        }
      },
      center: function() {
        if (document.activeElement.tagName === 'INPUT') {
          document.activeElement.value += this.$state.getState('editor');
        }
      },
      right: function() {
        if (document.activeElement.tagName === 'INPUT') {
          if (document.activeElement.value && document.activeElement.value.length > 0) {
            this.$state.setState('editor', document.activeElement.value);
            document.activeElement.value = '';
          }
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
    components: [],
    templateUrl: document.location.origin + '/templates/child_1.html',
    mounted: function() {
      this.$state.addStateListener('counter', this.methods.listenState);
      this.setData({ subcomponentIds: ['sc1', 'sc2'] });
      if (this.components.length === 0) {
        this.data.subcomponentIds.forEach((id) => {
          const c = subcomponent.clone();
          c.id = id;
          this.components.push(c);
        });
        this.render();
      }
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
        }, 'Cancel', undefined, undefined);
      },
      plus: function() {
        this.setData({ counter: this.data.counter + 1 });
        this.$state.setState('counter', this.$state.getState('counter') + 1);
      },
      testShowDialog: function() {
        this.$router.showDialog('Dialog', `<div class="kai-list-nav"><span class="sr-only">Test show dialog.</span><span aria-hidden="true">Test show dialog.</span></div>`, null, 'Yes', () => {}, 'Close', () => {
          window.close();
        }, 'Neutral', null, () => {});
      },
      testOptMenu: function() {
        const idx = this.data.opts.findIndex((opt) => {
          return opt.text === this.data.selected;
        });
        this.$router.showOptionMenu('Option', this.data.opts, 'Select', (selected) => {
          this.setData({ selected: selected.text });
        }, undefined, idx);
      },
      testSingleSelector: function() {
        const idx = this.data.opts.findIndex((opt) => {
          return opt.text === this.data.selected;
        });
        this.$router.showSingleSelector('Select', this.data.opts, 'Select', (selected) => {
          this.setData({ selected: selected.text });
        }, 'Cancel', null, undefined, idx);
      },
      testMultiSelector: function() {
        const idx = this.data.opts.findIndex((opt) => {
          return opt.text === this.data.selected;
        });
        this.$router.showMultiSelector('Select', this.data.opts, 'Select', null, 'Save', (options) => {
          this.setData({ opts: options });
        }, 'Cancel', null, undefined, 0);
      },
      testDatePicker: function() {
        this.$router.showDatePicker(null, null, null, (dt) => {
          this.setData({ title: dt.toLocaleDateString() });
        }, undefined);
      },
      testTimePicker: function() {
        this.$router.showTimePicker(null, null, null, (dt) => {
          this.setData({ title: dt.toLocaleTimeString() });
        }, undefined);
      },
      testToast: function() {
        this.$router.showToast('This is test toast');
      },
      testLoading: function() {
        if (this.$router.loading) {
          this.$router.showLoading();
        }
        setTimeout(() => {
          this.$router.hideLoading();
        }, 3000);
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
    softKeyText: { left: 'MINUS', center: 'SELECT', right: 'PLUS' },
    softKeyListener: {
      left: function() {
        this.$router.showDialog('Decrement', 'Are sure to minus -1 from counter ?', this.data, 'Yes', this.methods.minus, 'Cancel', undefined, undefined);
      },
      center: function() {
        const listNav = document.querySelectorAll(this.verticalNavClass);
        if (this.verticalNavIndex > -1) {
          listNav[this.verticalNavIndex].click();
        }
      },
      right: function() {
        this.$router.showDialog('Increment', 'Are sure to add +1 into counter ?', this.data, 'Yes', this.methods.plus, 'Cancel', undefined, undefined);
      }
    },
    softKeyInputFocusText: { left: 'Copy', center: 'Paste', right: 'Cut' },
    softKeyInputFocusListener: {
      left: function() {
        if (document.activeElement.tagName === 'INPUT') {
          if (document.activeElement.value && document.activeElement.value.length > 0) {
            this.$state.setState('editor', document.activeElement.value);
          }
        }
      },
      center: function() {
        if (document.activeElement.tagName === 'INPUT') {
          document.activeElement.value += this.$state.getState('editor');
        }
      },
      right: function() {
        if (document.activeElement.tagName === 'INPUT') {
          if (document.activeElement.value && document.activeElement.value.length > 0) {
            this.$state.setState('editor', document.activeElement.value);
            document.activeElement.value = '';
          }
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
    }
  });

  const ftc = firstTab.clone();
  ftc.name = 'ft_cloned';
  const secondChild = Kai.createTabNav('_CHILD_ 2', '.child2DemoNav', [firstTab, ftc, secondTab, thirdTab, fourthTab, fifthTab, seventhTab, eighthTab]);

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
      if (this.components.length === 0) {
        this.components = [createSubComponent('subcomponent0'), createSubComponent('subcomponent1')];
        this.render();
      }
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
    softKeyText: { left: 'PUSH', center: 'SELECT', right: 'POP' },
    softKeyListener: {
      left: function() {
        this.$router.push(lastChild);
      },
      center: function() {
        if (this.verticalNavIndex > -1) {
          const nav = document.querySelectorAll(this.verticalNavClass);
          nav[this.verticalNavIndex].click();
        }
      },
      right: function() {
        this.$router.pop();
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
    },
    backKeyListener: function() {
      this.components = [];
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
