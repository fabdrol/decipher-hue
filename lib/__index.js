'use strict'

const debug = require('debug')('decipher-hue')
const join = require('path').join
const fs = require('fs')
const huejay = require('huejay')

function retrieveConfig() {
	const path = join(process.env.HOME, '.essense')
	let data = null

	try {
		data = fs.readFileSync(path, 'utf-8')
		data = JSON.parse(data)
	} catch(e) {
		debug(`Can't read file ${path}: ${e.message}`)
	}

	return Promise.resolve(data)
}

function writeConfig(username, bridgeIp, bridgeId) {
	const path = join(process.env.HOME, '.essense')
	const data = {
		username,
		bridgeId, 
		bridgeIp,
	}

	try {
		fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
	} catch (e) {
		debug(`Error writing file: ${e.message}`)
		return Promise.reject(e.message)
	}

	return retrieveConfig()
}

retrieveConfig()
.then(config => {
	if (config !== null) {
		debug(`Using username (${config.username}) and IP (${config.bridgeIp}) from config.`)
		return new huejay.Client({
			host: config.bridgeIp,
			username: config.username,
		})
	}

	return huejay
	.discover({ strategy: 'all' })
	.then(bridges => {
		if (!Array.isArray(bridges) || bridges.length === 0) {
			throw new Error('No bridges found. Aborting')
		}

		debug(`Found bridge ${bridges[0].id} at ${bridges[0].ip}`)

		const bridge = bridges[0]
		const client = new huejay.Client({
		  host: bridge.ip
		})

		const userToCreate = new client.users.User
		userToCreate.deviceType = 'essense'

		return client.users
		.create(userToCreate)
		.then(user => {
			debug(`Created user: ${user.username}`)
			return writeConfig(user.username, bridge.ip, bridge.id)
		})
		.then(config => {
			return new huejay.Client({
				host: config.bridgeIp,
				username: config.username,
			})
		})
	})
})
.then(client => {
	client
	.lights
	.getAll()
	.then(lights => {
		debug('Lights')
		lights.forEach(l => {
			debug(`  ${l.attributes.attributes.name}`)
			debug(`    + type: ${l.attributes.attributes.type}`)
			debug(`    + state: ${l.state.attributes.on ? 'ON' : 'OFF'}`)

			if (l.state.attributes.on === true) {
				debug(`    + brightness: ${((l.state.attributes.bri) / 254).toFixed(2)} (${l.state.attributes.bri})`)
				debug(`    + temperature: ${parseInt(1000000 / l.state.attributes.ct, 10)}K (${l.state.attributes.ct})`)
			}

			if (l.state.attributes.on === true && typeof l.state.attributes.hue !== 'undefined') {
				debug(`    + hue: ${l.state.attributes.hue}`)
				debug(`    + saturation: ${l.state.attributes.sat}`)
			}

			console.log('')
		})
	})

	client
	.groups
	.getAll()
	.then(groups => {
		debug('Groups')
		groups.forEach(group => {
			debug(`  ${group.attributes.attributes.name}`)
			debug(`    + All on: ${group.state.attributes.all_on ? 'ON' : 'OFF'}`)
			debug(`    + Any on: ${group.state.attributes.any_on ? 'ON' : 'OFF'}`)
			console.log('')
		})
	})
})
.catch(err => {
	debug(`Error: ${err.message}`)
})