'use strict'

const EssenseHue = require('./EssenseHue')
const debug = require('debug')('essense-hue/index')

const h = new EssenseHue(err => {
	if (err) {
		debug(`Error whilst initialising EssenseHue: ${err.message}`)
		return
	}

	debug(`Initialised EssenseHue with ${h.lights.length} lights and ${h.groups.length} groups`)

	h.lights.forEach(light => {
		if (light.name === 'Toilet') {
			light.state = !light.state
			debug(light.name, light.state)
		}
	})

	h.groups.forEach(group => {
		if (group.name === 'Bedroom') {
			group.state = !group.state
			debug(group.name, group.state)
		}
	})
})