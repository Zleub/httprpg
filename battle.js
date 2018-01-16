let battle = (left, right) => {
	let ground = {
		front: [],
		left: [], center: [], right: [],
		back: []
	}

	let max = left.reduce( (p,e) => (p < e.attrs.name.length ? e.attrs.name.length : p), 0)
	let put_col = (c) => {
		if (c != ' ')
			process.stdout.write('|')
		else
			process.stdout.write(' ')
		for (var i = 0; i < max; i++) {
			process.stdout.write(c)
		}
		if (c != ' ')
			process.stdout.write('|')
		else
			process.stdout.write(' ')
	}

	put_col(' ')
	put_col('-')
	process.stdout.write('\n')
	left.forEach( e => {
		put_col(' ')
		console.log( `|${e.attrs.name}`.padEnd(max + 1) + '|' )
	})
	// process.stdout.write('\n')

	put_col('-')
	put_col('-')
	put_col('-')
	process.stdout.write('\n')
	left.forEach( e => {
		put_col(' ')
		console.log( `|${e.attrs.name}`.padEnd(max + 1) + '|' )
	})

	put_col('-')
	put_col('-')
	put_col('-')
	process.stdout.write('\n')

	left.forEach( e => {
		put_col(' ')
		console.log( `|${e.attrs.name}`.padEnd(max + 1) + '|' )
	})
	put_col(' ')
	put_col('-')
}

exports.battle = battle
