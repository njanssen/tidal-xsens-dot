import xsensManager, { PAYLOAD_TYPE } from '@vliegwerk/xsens-dot'
import Tidal from '@vliegwerk/tidal'

const tidal = new Tidal({
	outAddress: 'pro.local',
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

	tidal.cF('acc_x', data.freeAcceleration.x)
	tidal.cF('acc_y', data.freeAcceleration.y)
	tidal.cF('acc_z', data.freeAcceleration.z)
})

xsensManager.on('error', async (error) => {
	console.error(error)
})

process.on('SIGINT', async () => {
	await xsensManager.disconnectAll()
	process.exit()
})
