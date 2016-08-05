<script type="text/ecmascript6">
	export default {
		props: [
      // required for v-model component
      'label',
      'value',

      'placeholder'
    ],
    computed: {
      compPlaceholder: function () {
        return this.placeholder ? this.placeholder : this.label
      }
    },
    methods: {
      onInput: function (event) {
            this.$emit('input', event.target.value)
          }
    }
	}

</script>

<template>
		<div class="field">
      <label>{{ label }}</label>
      <input type="text" v-bind:placeholder="compPlaceholder" v-bind:value="value" v-on:input="onInput">
    </div>

</template>