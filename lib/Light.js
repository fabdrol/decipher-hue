'use strict'

const HueDevice = require('./HueDevice')
const debug = require('debug')('essense-hue/Light')

class Light extends HueDevice {
	constructor (device, client) {
		super('light', device, client)
	}

	get state () {
		return this._state.on
	}

	set state (on) {
		this._state.on = !!on
		this
		._client
		.lights
		.getById(this.id)
		.then(device => {
			device.on = !!on
			this._client.lights.save(device)
		})
		.catch(err => {
			debug(err.message)
		})
	}

	// get temperature () {

	// }

	// set temperature (kelvin) {

	// }

	// get brightness () {

	// }

	// set brightness (fraction) {
		
	// }
}

module.exports = Light