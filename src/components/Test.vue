<script type="text/ecmascript6">
	export default {
		data() {
			return {
				character: {}
			}
		}
	}

</script>

<template>

  <div>
    <h1 class="ui header">Semantic UI Fixed Template</h1>
    <form class="ui form">

      <div class="field">
        <label>First Name</label>
        <input type="text" placeholder="First Name" :v-model="character.name">
      </div>

      <div class="field">
        <label>Character Class</label>
        <select class="ui dropdown" :v-model="character.class">
        	<option disabled selected>Select your option</option>
        	<option value="Barbarian">Barbarian</option>
        	<option value="Bard">Bard</option>
        	<option value="Cleric">Cleric</option>
        	<option value="Druid">Druid</option>
        	<option value="Fighter">Fighter</option>
        	<option value="Monk">Monk</option>
        	<option value="Paladin">Paladin</option>
        	<option value="Ranger">Ranger</option>
        	<option value="Rogue">Rogue</option>
        	<option value="Sorcerer">Sorcerer</option>
        	<option value="Wizard">Wizard</option>
        	<option value="Warlock">Warlock</option>
        	</select>
      </div>

      <div class="field">
        <label>Character Level</label>
        <input type="text" placeholder="Level" :v-model="character.level">
      </div>
      <div class="field">
        <label>Character HP</label>
        <input type="text" placeholder="First Name" :v-model="character.hp">
      </div>

      <button class="ui button" type="submit">Submit</button>
    </form>


  </div>

</template>