'use strict'

const debug = require('debug')('decipher-hue')
const huejay = require('huejay')

const errorHandler = (err) => {
	debug(`Error: ${err.message}`)
	process.exit(1)
}

huejay
.discover({ strategy: 'all' })
.then(bridges => {
	if (!Array.isArray(bridges) || bridges.length === 0) {
		console.error('No bridges found. Aborting')
		return process.exit(1)
	}

	const bridge = bridges[0]
	debug(`Found bridge ${bridge.id} at ${bridge.ip}`)

	const client = new huejay.Client({
	  host: bridge.ip,
	  // username: ???, @TODO: create a user; store in a file in $HOME.
	})

	client
	.bridge
	.get()
	.then(bridge => {
		debug(`Bridge info:\n${JSON.stringify(bridge, null, 2)}`)
	})
	.catch(errorHandler)

	client
	.lights
	.getAll()
	.then(lights => {
		debug(`Connected lights:\n${JSON.stringify(lights, null, 2)}`)
	})
	.catch(errorHandler)
})
.catch(err => {
	debug(`Error: ${err.message}`)
})