let {
	log,
	notify,
	verbose_warn,
	verbose_created,
	verbose_constructor,
	verbose_instanciated
} = require('./utils.js')

let _common = (kl, k) => function (opt) {
	if (kl.__constructor) {
		verbose_constructor(k)
		kl.__constructor.call(this, opt)
	}

	/* !!! */
	// if (!this.attrs)
	// 	this.attrs = {}
	/* !!! */

	// if (typeof kl == 'function')
	// {
    //
	// }
	// else
    //

	// log(kl)
	let defaultFunctions = [
		String,
		Function,
		Array,
		Number,
		Object
	]

	// let __parent = (kl.__parent || 'Item')
	// let attrs = {}

	// this.attrs[__parent] = {}
	// this.attrs = Object.assign
	Object.getOwnPropertyNames(kl).filter(e => e.search(/^__.+/)).forEach(e => {
		if (typeof kl[e] == 'function' && !defaultFunctions.some(_ => _ == kl[e])) {
			console.log('!!?!!', e)
			this[e] = kl[e].bind(this)
		}
	// }, [])
		else
		// if (typeof kl == 'function')
		// 	this[e] = kl[e]
		// else
		// console.log(e, kl.__parent, global[kl.__parent].description)
		if (this.attrs[e] == undefined || (global[kl.__parent] && global[kl.__parent].description[e] == this.attrs[e]) || typeof this.attrs[e] == 'function') {
			// console.log(`this.attrs[${e}] = ${kl[e]}`)
			this.attrs[e] = kl[e]
			this[e] = function(v) { return v ? (this.attrs[e] = v) : this.attrs[e] }
		}
	})
	// if ((kl.__parent || 'Item') != k)
	// attrs[__parent] = this.attrs
	// this.attrs = attrs
    //
	let v = Object.getOwnPropertyNames(kl).filter(e => e.search(/^__.+/)).reduce( (p, e) => {
		if (!this.attrs[e] || typeof this.attrs[e] == 'function')
			p.push(e)
		return p
	}, [])

	// console.log(this.type())

	// console.log(k, kl)
	// console.log(this)


	verbose_instanciated(k)
	if (v.length != 0) {
		verbose_warn(`Some properties are missing:`)
		notify(`\t${v}`)
	}

	if (!this.type() || defaultFunctions.some(_ => _ == this.type()))
		this.type([k])
	else
		this.type().push(k)


}

// class Elf {
// 	constructor(opt) {
// 		this.attrs = opt
// 	}
//
// 	get id() { return this.attrs.character.item.id }
// 	get id() { return this.attrs['character']['item'].id }
// 	get name() {}
// 	get name() {}
// }

let capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

let toString = (kl, k) => {
	if (kl[k].name == 'Number')
		return 'Int'
	// if (kl[k].name == undefined)
		// return capitalizeFirstLetter(k)
	if (kl[k].name == 'Array')
	// 	return `[Item]`
		return `[String]`
		// return undefined
	if (typeof kl[k] == 'string' && Object.keys(global.schema).some(_ => _ == kl[k].match(/\w+/)))
		return kl[k]

	return kl[k].name
}
let schematize = (k, kl, p) => {
	let keys = Object.keys(kl) // .filter( e => !e.match(/^__.*/) )
	// console.log(k, kl, p)
	// console.log(global.schema)
	if (keys.length != 0) {
		global.schema[k] = [`type ${k} {\n`].concat(
			// global.schema[`${p ? p : "Item"}`].slice(1, -1)
			[p ? `\t${p.toLowerCase()}: [${p}]!\n` : `\titem: Item!\n`]
		).concat(
			keys.map( k => {
				if (!k.match(/^__.*/) && toString(kl, k))
					return `\t${k}: ${ toString(kl, k) }!\n`
				return ''
		} )).concat(["}\n\n"])
	}
}

exports.metaFactory = klass => {
	Object.getOwnPropertyNames(klass).forEach( k => {
		let kl = klass[k]
		let common = _common(kl, k)

		if (kl.__parent && global[kl.__parent]) {
			global[k] = class extends global[kl.__parent] {
				constructor(opt) {
					super(opt)
					common.call(this, opt)
				}
				static get name() { return k }
				static get description() { return klass[k] }
			}

			if (!k.match(/\s/)) // is a character class
				schematize(k, kl, kl.__parent)
		}
		else if (global['Item']) {
			global[k] = class extends Item {
				constructor(opt) {
					super(opt)
					common.call(this, opt)
				}
				static get name() { return k }
				static get description() { return klass[k] }
			}

			schematize(k, kl)
		}
		else {
			global[k] = class {
				constructor(opt) {
					common.call(this, opt)
				}
				static get name() { return k }
				static get count() { return Item._id || 0 }
				static set count(v) { Item._id = v }
				static get description() { return klass[k] }
			}

			global.schema[k] =
				[`type ${k} {\n`].concat(
					Object.keys(kl).map( k => {
						if (!k.match(/^__.*/))
							return `\t${k}: ${ toString(kl, k) }!\n`
						return ''
				} )).concat(["}\n\n"])

		}
		verbose_created(k)
		return global[k]
	})
}
