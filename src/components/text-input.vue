<script type="text/ecmascript6">
	export default {
		props: [
      'label',
      'placeholder',
      'model'
      ]
	}

</script>

<template>
		<div>
    <label>First Name</label>
    <input type="text" placeholder="First Name" :v-model="character.name">
    </div>

</template>