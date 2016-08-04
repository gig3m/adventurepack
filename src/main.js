import PouchDB from 'pouchdb'
import Vue from 'vue/dist/vue.js'

// Setup Pouch DB and query plugin
PouchDB.plugin(require('pouchdb-find'));
var db = new PouchDB('advpack')

// Pull in page components
import Test from './components/Test.vue'

// Pull in global components and register
Vue.component('text-input', require('./components/text-input.vue'))

new Vue({
  el: '#app',
  data: {
    currentView: 'Test'
  },
  components: {
  	Test
  }
})

