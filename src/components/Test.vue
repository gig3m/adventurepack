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

	<div class="ui grid">
		<div class="sixteen wide column">
		<h1 class="ui header">Character Creation</h1>
		</div>
		<div class="sixteen wide column">
		<form class="ui form">

			<div class="two fields">
				<div class="field">
					<label>Full Name</label>
					<input type="text" placeholder="Full Name" :v-model="character.name">
				</div>

				<div class="field">
					<label>Player</label>
					<input type="text" placeholder="Player" :v-model="character.player">
				</div>
			</div>

			<div class="four fields">
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
					<label>Sex</label>
					<select class="ui dropdown" :v-model="character.sex">
						<option disabled selected>Select your option</option>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
					</select>
				</div>

				<div class="field">
					<label>Race</label>
					<select class="ui dropdown" :v-model="character.race">
						<option disabled selected>Select your option</option>
						<option value="Dragonborn">Dragonborn</option>
						<option value="Dwarf">Dwarf</option>
						<option value="Elf">Elf</option>
						<option value="Gnome">Gnome</option>
						<option value="Half-elf">Half-elf</option>
						<option value="Half-Orc">Half-Orc</option>
						<option value="Halfling">Halfling</option>
						<option value="Human">Human</option>
						<option value="Tiefling">Tiefling</option>
						<option value="Genasi">Genasi</option>
						<option value="Goliath">Goliath</option>
					</select>		
				</div>

				<div class="field">
					<label>Sub-race</label>
					<input type="text" placeholder="Sub-race" :v-model="character.sub_race">
				</div>
			</div>
			<div class="four fields">

				<div class="field">
					<label>Alignment</label>
					<input type="text" placeholder="First Name" :v-model="character.alignment">
				</div>

				<div class="field">
					<label>Background</label>
					<input type="text" placeholder="First Name" :v-model="character.background">
				</div>

				<div class="field">
					<label>Level</label>
					<input type="text" placeholder="Level" :v-model="character.level">
				</div>

				<div class="field">
					<label>Expierience Points</label>
					<input type="text" placeholder="First Name" :v-model="character.xp">
				</div>
			</div>

			<div class="six fields">
				<div class="one field">
						<label>Strength</label>
					<div class="ui massive input">
						<input type="text" :v-model="character.str">
					</div>
					<div class="grouped fields">
					    <div class="inline field">
					    	<div class="ui checkbox"></div>
						    	<input type="checkbox" class="hidden" :v-model="character.s">
						    	<label>This</label>
						    </div>	
					    </div>
					</div>
				</div>

			</div>





	<button class="ui button" type="submit">Submit</button>
	</form>


</div>

</template>