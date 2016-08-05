<script type="text/ecmascript6">
	export default {
    data() {
      return {
        state: null
      }
    },
		props: [
      // required for v-model component
      'label',
      'value',

      'trueValue',
      'falseValue'
    ],
    computed: {
      compTrue: function () {
        return this.trueValue ? this.trueValue : true
      },
      compFalse: function () {
        return this.falseValue ? this.falseValue : false
      }
    },
    methods: {
      onChange: function (event) {
        if (this.state == true) {
          this.$emit('input', this.compFalse)
          this.state = false
        }
        else
        {
          this.$emit('input', this.compTrue) 
          this.state = true            
        }
        console.log('state', this.state)     
            
      }
    },
    mounted: function () {
      this.state = this.value ? this.value : false
    }
	}

</script>

<template>

  <div class="ui slider checkbox">
    <input type="checkbox" v-bind:value="value" v-bind:true-value="compTrue" v-bind:false-value="compFalse" v-on:change="onChange">
    <label>{{ label }}</label>
  </div>

</template>