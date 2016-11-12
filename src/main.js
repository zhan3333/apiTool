import Vue from 'vue'
import App from './App'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

/* eslint-disable no-new */
Vue.use(Vuex)
Vue.use(ElementUI)

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count ++
    },
    decrement (state) {
      state.count --
    }
  }
})

// 创建根实例
new Vue({
  store,
  el: '#app',
  template: '<App/>',
  components: { App },
  render: h => h(App)
})

