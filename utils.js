let Chance = require('chance')
let chance = new Chance()
let colors = require('./colors.js')
let inspect = require('util').inspect

let log = (e, d) => process.opt['--verbose'] ? console.log(inspect(e, {
	breakLength: 42,
	colors: true,
	depth: (d === undefined) ? null : d
})) : undefined

let notify = e => process.opt['--verbose'] ? console.log(`${e}`) : undefined

let verbose_help = () => {
	if (process.opt['--verbose']) {
		process.stdout.write('instanciated'.blue + ' -- ')
		process.stdout.write('created'.magenta + ' -- ')
		console.log('__constructor'.yellow)
	}
}

let verbose_instanciated = e => notify(`${e.blue}`)
let verbose_created = e => notify(`${e.magenta}`)
let verbose_constructor = e => notify(`${('__' + e).yellow}`)
let verbose_warn = e => process.opt['--verbose'] ? console.warn(`${e}`.red) : undefined

let d4gen = () => {
	let d4 = chance.d4()
	return () => d4
}
let randomCharacter = (klass) => {
	return new klass ({
		name: chance.name(),
		description: "...",
		race: klass.name,
		attributes: {
			agility: d4gen(),
			smarts: d4gen(),
			spirit: d4gen(),
			strength: d4gen(),
			vigor: d4gen()
		}
	})
}

exports.log = log
exports.notify = notify
exports.verbose_help = verbose_help
exports.verbose_warn = verbose_warn
exports.verbose_instanciated = verbose_instanciated
exports.verbose_created = verbose_created
exports.verbose_constructor = verbose_constructor
exports.randomCharacter = randomCharacter
