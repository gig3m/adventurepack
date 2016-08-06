import PouchDB from 'pouchdb'

// Setup query plugin
PouchDB.plugin(require('pouchdb-find'))
PouchDB.debug.enable('pouchdb:find')
var db = new PouchDB('advpack')

export default {

	saveCharacter: function (character) {
		// this should produce character_First-Second-Last
		character._id = 'character_'+character.name.replace(/\s+/g, '-')
		character.documentType = "Character"
		db.post(character)
	},

	getCharacters: function () {
		return db.createIndex({
			index: {fields: ['documentType']}
		}).then(function() {
			return db.find({
				selector: {documentType: 'Character'}
			}).then(function(results) {
				return results.docs
			})

		})
	}


}
