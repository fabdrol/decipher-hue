'use strict'

const HueDevice = require('./HueDevice')
const debug = require('debug')('essense-hue/Group')

class Group extends HueDevice {
	constructor (device, client) {
		super('group', device, client)
	}

	get state () {
		return this._state.all_on
	}

	set state (on) {
		this._state.all_on = !!on
		this._client.groups.getById(this.id).then(group => {
			group.on = !!on
			this._client.groups.save(group)
		})
	}
}

module.exports = Group