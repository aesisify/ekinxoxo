import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'
import JsonViewer from 'vue-json-viewer'

import App from './App.vue'
import router from './router'

import './assets/main.css'

import { Icon } from "@iconify/vue2";

Vue.use(JsonViewer)
Vue.use(PiniaVuePlugin)

Vue.component("Icon", Icon);

new Vue({
  router,
  pinia: createPinia(),
  render: (h) => h(App)
}).$mount('#app')
