'use strict'

const debug = require('debug')('essense-hue')
const join = require('path').join
const fs = require('fs')
const huejay = require('huejay')
const Light = require('./Light')
const Group = require('./Group')

class EssenseHue {
	constructor (cb) {
		this.client = null
		this.lights = []
		this.groups = []
		this.init(err => {
			if (err) {
				return cb(err)
			}

			this.load(cb)
		})
	}

	load (cb) {
		if (this.client === null) {
			return cb(new Error('Client is NULL'))
		}

		this.client.lights.getAll().then(lights => {
			this.lights = lights.map(device => {
				return new Light(device, this.client)
			})

			return this.client.groups.getAll()
		})
		.then(groups => {
			this.groups = groups.map(device => {
				return new Group(device, this.client)
			})

			return cb()
		})
		.catch(err => {
			debug(`Error getting lights or groups: ${err.message}`)
			return cb(err)
		})
	}

	init (cb) {
		this.
		retrieveConfig()
		.then(config => {
			if (config !== null) {
				this.client = new huejay.Client({
					host: config.bridgeIp,
					username: config.username,
				})

				debug(`Using username (${config.username}) and IP (${config.bridgeIp}) from config.`)
				return cb()
			}

			huejay
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
					this.client = new huejay.Client({
						host: config.bridgeIp,
						username: config.username,
					})
					return cb()
				})
			})
		})
		.catch(err => {
			debug(`Error in Hue intialisation: ${err.message}`)
			return cb(err)
		})
	}

	retrieveConfig () {
		const path = join(process.env.HOME, '.essense')
		let data = null

		try {
			data = fs.readFileSync(path, 'utf-8')
			data = JSON.parse(data)
		} catch(e) {
			debug(`Can't read config file ${path}: ${e.message}`)
		}

		return Promise.resolve(data)
	}

	writeConfig (username, bridgeIp, bridgeId) {
		const path = join(process.env.HOME, '.essense')
		const data = {
			username,
			bridgeId, 
			bridgeIp,
		}

		try {
			fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
		} catch (e) {
			debug(`Error writing config file: ${e.message}`)
			return Promise.reject(e.message)
		}

		return this.retrieveConfig()
	}
}

module.exports = EssenseHue