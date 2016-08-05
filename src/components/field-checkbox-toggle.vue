<script type="text/ecmascript6">
	export default {
		props: [
      // required for v-model component
      'label',
      'value'
    ],
    computed: {
      compPlaceholder: function () {
        return this.placeholder ? this.placeholder : this.label
      }
    },
    methods: {
      onChange: function (event) {
            this.$emit('input', event.target.value)
          }
    }
	}

</script>

<template>

  <div class="ui toggle checkbox">
    <input type="checkbox" v-bind:value="value" v-on:change="onChange">
    <label>{{ label }}</label>
  </div>

</template>