<script type="text/ecmascript6">
	export default {
		props: [
      // required for v-model component
      'label',
      'value',

      // can accept array of strings or array of objects matching
      // [{ value: "1", text: "One" }, ... ]
      'options'
    ],
    computed: {
      optionsList () {
        if (typeof this.options[0] == 'string') {
          return this.options.map(function (option) {
            return {value: option, text: option}
          }, [])
        }
        return this.options
      }
    },
    methods: {
      onChange: function (event) {
            this.$emit('input', event.target.value)
          }
    }
	}

</script>

<!-- <template>
  <div class="ui selection dropdown">
    <input type="hidden" v-bind:value="value" v-on:change="onChange">
    <i class="dropdown icon"></i>
    <div class="default text">{{ label }}</div>
    <div class="menu">
      <div class="item" v-for="option in optionsList" v-bind:data-value="option.value">{{ option.text }}</div>
    </div>
  </div>

</template> -->

<template>
  <div class="field">
    <label>{{ label }}</label>
    <select class="ui dropdown" v-bind:value="value" v-on:change="onChange">
      <option v-for="option in optionsList" v-bind:value="option.value">{{ option.text }}</option>
    </select>
  </div>
</template>