<script type="text/ecmascript6">
import PouchDB from 'pouchdb'
import CharacterService from '../services/CharacterService.js'

	export default {
		data() {
			return {
				characters: null
			}
		},
		mounted() {
			self = this
			CharacterService.getCharacters().then(function(result) {
				self.characters = result
			})
		}
	}

</script>

<template>


		<table class="ui striped table">
			<thead>
				<th>Name</th>
				<th>Description</th>
				<th>Player</th>
			</thead>
			<tbody>
				<tr v-for="character in characters">
					<td>{{ character.name }}</td>
					<td>{{ character.race }} {{ character.class }} ({{ character.level }})</td>
					<td>{{ character.playername }}</td>
				</tr>
			</tbody>
		</table>






</template>