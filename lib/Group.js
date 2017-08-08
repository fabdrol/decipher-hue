'use strict'

const HueDevice = require('./HueDevice')
const debug = require('debug')('essense-hue/Group')

class Group extends HueDevice {
	constructor (device, client) {
		super('group', device, client)
	}
}

module.exports = Group