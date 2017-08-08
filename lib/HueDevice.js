'use strict'

const debug = require('debug')('essense-hue/HueDevice')

class HueDevice {
	constructor (type, device, client) {
		this._type = type
		this._attributes = device.attributes.attributes
		this._state = device.state.attributes
		this._client = client
		this._id = this._attributes.id
		this._name = this._attributes.name
		this._device = device

		debug(`Registered new ${type}: ${this._attributes.name}`)
	}

	get device () {
		return this._device
	}

	get name () {
		return this._name
	}

	get id () {
		return this._id
	}
}

module.exports = HueDevice
