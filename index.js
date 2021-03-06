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
			this.attrs = {}
			// console.log('->', this, opt, global[opt.__parent])
			this.attrs = Object.assign(opt, {
				id: (Item.count++),
				// elf: {
				// 	character: {
				// 		item: {
				// 			id: (Item.count++)
				// 		}
				// 	}
				// }
			})
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
			let p = (opt.__parent ? global[opt.__parent].factory : {})
			opt = Object.keys(opt).reduce((p,k) => {
				if (typeof opt[k] != 'function')
					p[k] = opt[k]
				return p
			}, {})
			// console.log(`parent`, p)
			// console.log(`attrs`, this.attrs)
			// console.log(`-> ${opt.label}`, opt)
			return metaFactory({
				// [opt.label /*warning*/]: Object.assign(p, {
				// 	__parent: 'Character'
				// }, opt)
				[opt.label /*warning*/]: {
					__parent: 'Character'
				}
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
	label: 'TestItem',
	description: 'A test description'
})

new Race({
	label: 'Elf',
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
	label: 'Dwarf',
	race: 'Dwarf',
	description: 'A dwarf factory declaration'
})

new Race({
	label: 'DarkElf',
	race: 'DarkElf',
	// description: 'An darkelf factory declaration',
	__parent: 'Elf'
})

let races = [ Elf, Dwarf, DarkElf ]

// let group = new Group({
// 	name: "Test ?",
// })

// log(db)
// log('----------------------------------------------')

let Chance = require('chance')
let chance = new Chance()
let d4gen = () => {
	let d4 = chance.d4()
	return () => d4
}
new DarkElf({
	label: chance.name(),
	description: "...",
	attributes: {
		agility: d4gen(),
		smarts: d4gen(),
		spirit: d4gen(),
		strength: d4gen(),
		vigor: d4gen()
	}
})

for (var i = 0; i < 2; i++) {
	let r = Math.floor(Math.random() * races.length)
	// group.push( randomCharacter(races[r]) )
	randomCharacter(races[r])
}

// battle(group, undefined)
// log(db)








var { readFileSync } = require('fs')
var { graphql, buildSchema } = require('graphql')

let stringSchema = Object.keys(global.schema).reduce( (p, e) => {
	p += global.schema[e].reduce( (p, e) => (p += e), "" )
	return p
}, "" ) + "type Query {\n" + Object.keys(global.schema).reduce( (p, k) => {
	if (!k.match(/^_/))
		p += `\t${k.toLowerCase()}(id: [ID], label: [String]): [${k}]!\n`
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
