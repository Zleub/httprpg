let {
	log,
	randomCharacter,
	verbose_help,
	verbose_created,
	verbose_constructor,
	verbose_instanciated
} = require('./utils.js')
let { metaFactory } = require('./core.js')
let { battle } = require('./battle.js')

let db = []

global.schema = {}
process.opt = process.argv.reduce((p,e) => {
	if (e.match(/^--.+/))
		p[e] = true
	return p
}, {})

verbose_help()

metaFactory({
	Item: {
		id: Number,
		type: Array,

		label: String,
		description: String,
		__constructor: function (opt) {
			this.attrs = {
				id: (Item.id++)
			}
			db.push(this)
		}
	},
	Group: Array.prototype,
	Race: {
		race: String,
		// attributes: {
		// 	agility: Number,
		// 	smarts: Number,
		// 	spirit: Number,
		// 	strength: Number,
		// 	vigor: Number
		// },
		// skills: Array,
		// edges: Array,
		// hindrances: Array,
		// statistics: {
		// 	pace: Number,
		// 	parry: Number,
		// 	charisma: Number,
		// 	toughness: Number
		// },
		// gear: Array,
		__parent: 'Race',
		__constructor: function (opt) {
			return metaFactory({
				[opt.name]: Object.assign({
					__parent: 'Character'
				}, opt)
			})
		}
	},
	Character: {
		race: 'Race',
		attributes: {
			agility: Number,
			smarts: Number,
			spirit: Number,
			strength: Number,
			vigor: Number
		},
		skills: Array,
		edges: Array,
		hindrances: Array,
		statistics: {
			pace: Number,
			parry: Number,
			charisma: Number,
			toughness: Number
		},
		gear: '[Item]',
		// age: Number, // ?? !! ??
		__constructor: function (opt) {
			// console.log('FAIL')
			// console.log(this, opt)
			// return new global[opt.race](opt)
			// return metaFactory({
			// 	[opt.name]: Object.assign({
			// 		__parent: this.constructor
			// 	}, opt)
			// })
			// return new opt
			return this
		}
	},
	Consommable: {
		nb_utilisation: Number
	},
	Potions: {
		__parent: 'Consommable'
	}
})

new Item({
	name: 'TestItem',
	description: 'A test description'
})

new Race({
	name: 'Elf',
	race: 'Elf',
	description: 'An elf factory declaration',
	attributes: {
		agility: 0,
		smarts: 0,
		spirit: 0,
		strength: 0,
		vigor: 0
	}
})

new Race({
	name: 'Dwarf',
	race: 'Dwarf',
	description: 'A dwarf factory declaration'
})

metaFactory({
	'DarkElf': { __parent: 'Elf' }
})

let races = [ Elf, Dwarf, DarkElf ]

// let group = new Group({
// 	name: "Test ?",
// })

for (var i = 0; i < 2; i++) {
	let r = Math.floor(Math.random() * races.length)
	// group.push( randomCharacter(races[r]) )
	randomCharacter(races[r])
}

// battle(group, undefined)
log(db)

var { readFileSync } = require('fs')
var { graphql, buildSchema } = require('graphql')

let stringSchema = Object.keys(global.schema).reduce( (p, e) => {
	p += global.schema[e].reduce( (p, e) => (p += e), "" )
	return p
}, "" ) + "type Query {\n" + Object.keys(global.schema).reduce( (p, k) => {
	if (!k.match(/^_/))
		p += `\t${k.toLowerCase()}(id: [ID], name: [String]): [${k}]!\n`
	return p
}, "" ) + "}\n"

console.log(stringSchema)

require('fs').writeFileSync('./core.graphql', stringSchema)
var schema = buildSchema( stringSchema )
// var schema = buildSchema( require('fs').readFileSync('./_core.graphql').toString() )

let solve = (k) => (query) => {
	let keys = Object.keys(query)
	let res = keys.length ?
		db.filter(e =>
			keys.some( _k =>
				query[_k].some( _ => String(e.attrs[_k]) == _ )
				&& e.attrs.type.some(_ => _ == k)
			)
		).map(e => e.attrs) :
		db.filter( e => e.attrs.type.some(_ => _ == k) ).map(e => e.attrs)
	// console.log(k, res)
	return res

}

var root = Object.keys(global.schema).reduce((p, e) => {
	p[e.toLowerCase()] = solve(e)
	return p
}, {})

const express = require('express');
const graphqlHTTP = require('express-graphql');

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
  rootValue: root
}));

app.listen(4000);
