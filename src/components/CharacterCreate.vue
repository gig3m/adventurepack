<script type="text/ecmascript6">
	export default {
		data() {
			return {
				character: {
					proficiencies: {
						stealth: true
					}
				},
				classOptions: [
						"Barbarian",
						"Bard",
						"Cleric",
						"Druid",
						"Fighter",
						"Monk",
						"Paladin",
						"Ranger",
						"Rogue",
						"Sorcerer",
						"Wizard",
						"Warlock"
				],
				raceOptions: [
						"Dragonborn",
						"Dwarf",
						"Elf",
						"Gnome",
						"Half-elf",
						"Half-Orc",
						"Halfling",
						"Human",
						"Tiefling",
						"Genasi",
						"Goliath"
				],
				alignmentOptions: [
						"Lawful Good",
						"Neutral Good",
						"Chaotic Good",
						"Lawful Neutral",
						"Neutral",
						"Chaotic Neutral",
						"Lawful Evil",
						"Neutral Evil",
						"Chaotic Evil"
				]
			}
		}
	}

</script>

<template>

<form class="ui form">
	<div class="ui segments">
		<div class="ui tertiary red segment">
				<h1 class="ui header">Character Creation {{character.name}}</h1>
		</div>
		<div class="ui tertiary red segment">

			<div class="two fields">

				<field-text-input 
					label="Full Name" 
					v-model="character.name"
				></field-text-input>

				<field-text-input 
					label="Player"  
					v-model="character.playername"
				></field-text-input>

			</div>
		</div>
		<div class="ui horizontal segments">
			<div class="ui tertiary red segment">


					<field-select 
						label="Sex" 
						v-model="character.sex" 
						:options="['Male', 'Female']"
					></field-select>

					<field-text-input 
						label="Age"  
						v-model="character.age"
					></field-text-input>

					<field-select 
						label="Race" 
						v-model="character.race" 
						:options="raceOptions"
					></field-select>

					<field-text-input 
						label="Subrace" 
						v-model="character.subrace"
					></field-text-input>


			</div>
			<div class="ui tertiary red segment">

						<field-select 
							label="Class" 
							v-model="character.class" 
							:options="classOptions"
						></field-select>

						<field-select 
							label="Alignment" 
							v-model="character.alignment" 
							:options="alignmentOptions"
						></field-select>

						<field-text-input 
							label="Background" 
							v-model="character.background"
						></field-text-input>

						<div class="two fields">

							<field-text-input 
								label="Level" 
								v-model="character.level"
							></field-text-input>

							<field-text-input 
								label="Experience Points" 
								v-model="character.xp"
							></field-text-input>

						</div>

			</div>
		</div>
		<div class="ui tertiary red segment">
			
			<div class="six fields">
				<div class="ui massive input stat">

							<field-text-input 
								label="Strength" 
								placeholder="Str" 
								v-model="character.str"
							></field-text-input>

							<field-text-input 
								label="Dexterity"  
								placeholder="Dex" 
								v-model="character.dex"
							></field-text-input>

							<field-text-input 
								label="Constitution"  
								placeholder="Con" 
								v-model="character.con"
							></field-text-input>

							<field-text-input 
								label="Intelligence"  
								placeholder="Int" 
								v-model="character.int"
							></field-text-input>

							<field-text-input 
								label="Wisdom"  
								placeholder="Wis" 
								v-model="character.wis"
							></field-text-input>

							<field-text-input 
								label="Charisma"  
								placeholder="Cha" 
								v-model="character.cha"
							></field-text-input>
				</div>
			</div>

		</div>
		<div class="ui tertiary red segment">
			
			<!-- Proficiencies -->
			<div class="six fields">
			
				<!-- STR -->
				<div class="field profs">

					<field-checkbox 
						label="Saving Throw" 
						v-model="character.proficiencies.strSavingThrow" 
					></field-checkbox><br />

					<field-checkbox 
						label="Athletics" 
						v-model="character.proficiencies.athletics" 
					></field-checkbox><br />

				</div>

				<!-- DEX -->
				<div class="field profs">

					<field-checkbox 
						label="Saving Throw" 
						v-model="character.proficiencies.dexSavingThrow"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Acrobatics" 
						v-model="character.proficiencies.acrobatics"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Sleight of Hand" 
						v-model="character.proficiencies.sleightOfHand"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Stealth" 
						v-model="character.proficiencies.stealth"
					></field-checkbox><br />

				</div>

				<!-- CON -->
				<div class="field profs">

					<field-checkbox 
						label="Saving Throw" 
						v-model="character.proficiencies.conSavingThrow"
					></field-checkbox><br />

				</div>

				<!-- INT -->
				<div class="field profs">

					<field-checkbox 
						label="Saving Throw" 
						v-model="character.proficiencies.intSavingThrow"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Arcana" 
						v-model="character.proficiencies.arcana"
					></field-checkbox><br />
					
					<field-checkbox 
						label="History" 
						v-model="character.proficiencies.history"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Investigation" 
						v-model="character.proficiencies.investigation"
					></field-checkbox><br />

					<field-checkbox 
						label="Nature" 
						v-model="character.proficiencies.nature"
					></field-checkbox><br />

					<field-checkbox 
						label="Religion" 
						v-model="character.proficiencies.religion"
					></field-checkbox><br />

				</div>

				<!-- WIS -->
				<div class="field profs">

					<field-checkbox 
						label="Saving Throw" 
						v-model="character.proficiencies.wisSavingThrow"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Animal Handling" 
						v-model="character.proficiencies.animalHandling"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Insight" 
						v-model="character.proficiencies.insight"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Medicine" 
						v-model="character.proficiencies.medicine"
					></field-checkbox><br />

					<field-checkbox 
						label="Perception" 
						v-model="character.proficiencies.perception"
					></field-checkbox><br />

					<field-checkbox 
						label="Survivial" 
						v-model="character.proficiencies.survival"
					></field-checkbox><br />

				</div>

				<!-- CHA -->
				<div class="field profs">

					<field-checkbox 
						label="Saving Throw" 
						v-model="character.proficiencies.chaSavingThrow"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Deception" 
						v-model="character.proficiencies.deception"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Intimidation" 
						v-model="character.proficiencies.intimidation"
					></field-checkbox><br />
					
					<field-checkbox 
						label="Performance" 
						v-model="character.proficiencies.performance"
					></field-checkbox><br />

					<field-checkbox 
						label="Persuasion" 
						v-model="character.proficiencies.persuasion"
					></field-checkbox><br />

				</div>


			</div>

		</div>
		<div class="ui tertiary red segment">
			<button class="ui large violet button" type="submit">Submit</button>
		</div>


	</div>
</form>

</template>