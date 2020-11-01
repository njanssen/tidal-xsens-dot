import xsensManager, { PAYLOAD_TYPE } from '@vliegwerk/xsens-dot'

let samples = {}
let timestamps = {}

xsensManager.on('dot', async (identifier) => {
	await xsensManager.connect(identifier)
    await xsensManager.subscribeMeasurement(identifier, PAYLOAD_TYPE.freeAcceleration)
    samples[identifier] = 0
    timestamps[identifier] = new Date()
})

xsensManager.on('measurement', (identifier, data) => {
    samples[identifier] = samples[identifier]+1
})

process.on('SIGINT', async () => {
    await xsensManager.disconnectAll()
    const tsStop = new Date()

    const identifiers = xsensManager.identifiersOfAvailableDots
    for (let identifier of identifiers) {
        if (typeof samples[identifier] !== 'undefined') {
            const tsStart = timestamps[identifier]
            const tsSamples = tsStop.getTime() - tsStart.getTime()
            const tsPerSample = tsSamples / samples[identifier]
            console.log(`Samples for ${identifier}: ${samples[identifier]} @ ${tsPerSample}ms`)
        }
    }
	process.exit()
})
