import xsensManager, { PAYLOAD_TYPE } from '@vliegwerk/xsens-dot'
import Tidal from '@vliegwerk/tidal'

const WINDOW_SIZE = 10
const samples = {
	freeAcceleration : {
		x : [],
		y : [],
		z : []
	}
}

const tidal = new Tidal({
	inAddress: '0.0.0.0',
	outAddress: '192.168.3.146',
	broadcast: false,
})

tidal.on('ready', () => {
	console.log('Tidal UDP port ready')
})

xsensManager.on('dot', async (identifier) => {
	await xsensManager.connect(identifier)
	await xsensManager.subscribeMeasurement(identifier, PAYLOAD_TYPE.freeAcceleration)
})

xsensManager.on('measurement', (identifier, data) => {
	console.log(`Measurement (${identifier}):`, data)

	const {
		x, y, z
	} = data.freeAcceleration

	samples.freeAcceleration.x.unshift(x)
	if (samples.freeAcceleration.x > WINDOW_SIZE) samples.freeAcceleration.x.pop()

	samples.freeAcceleration.y.unshift(y)
	if (samples.freeAcceleration.y > WINDOW_SIZE) samples.freeAcceleration.y.pop()

	samples.freeAcceleration.z.unshift(z)
	if (samples.freeAcceleration.z > WINDOW_SIZE) samples.freeAcceleration.z.pop()

	tidal.cF('acc_x', x)
	tidal.cF('acc_y', y)
	tidal.cF('acc_z', z)
	tidal.cF('acc_x_mean', mean(samples.freeAcceleration.x))
	tidal.cF('acc_y_mean', mean(samples.freeAcceleration.y))
	tidal.cF('acc_z_mean', mean(samples.freeAcceleration.z))
	tidal.cF('acc_x_stddev', stddev(samples.freeAcceleration.x))
	tidal.cF('acc_y_stddev', stddev(samples.freeAcceleration.y))
	tidal.cF('acc_z_stddev', stddev(samples.freeAcceleration.z))
})

xsensManager.on('error', async (error) => {
	console.error(error)
})

process.on('SIGINT', async () => {
	await xsensManager.disconnectAll()
	process.exit()
})

// Min-max normalization [-1,1]
const minmax = (input, min, max) => {
	average = (min + max) / 2
	range = (max - min) / 2
	normalized_x = (input - average) / range
	return normalized_x
}

// Arithmetic mean
const mean = (arr) => {
	return (
		arr.reduce(function (a, b) {
			return Number(a) + Number(b)
		}) / arr.length
	)
}

// Standard deviation
const stddev = (arr) => {
	let m = mean(arr)
	return Math.sqrt(
		arr.reduce(function (sq, n) {
			return sq + Math.pow(n - m, 2)
		}, 0) /
			(arr.length - 1)
	)
}
