import PouchDB from 'pouchdb'
import Vue from 'vue/dist/vue.js'

// Setup Pouch DB and query plugin
PouchDB.plugin(require('pouchdb-find'));
var db = new PouchDB('advpack')

// Pull in page components
import CharacterCreate from './components/CharacterCreate.vue'

// Pull in global components and register
Vue.component('field-text-input', require('./components/field-text-input.vue'))
Vue.component('field-select', require('./components/field-select.vue'))
Vue.component('field-checkbox-toggle', require('./components/field-checkbox-toggle.vue'))
Vue.component('field-checkbox-slider', require('./components/field-checkbox-slider.vue'))
Vue.component('field-checkbox', require('./components/field-checkbox.vue'))

new Vue({
  el: '#app',
  data: {
    currentView: 'CharacterCreate'
  },
  components: {
  	CharacterCreate
  }
})

