const fs = require('node:fs');
const path = require('node:path')
const dataPath = path.join(__dirname, '../', 'localData')
const { AvailableEvents } = require('../types/Events');
const { Event } = require('../classes/EventClass');

function loadData(internalData) {
    const registry = JSON.parse(fs.readFileSync(path.join(dataPath,'dataRegistry.json')))
    for (const file of fs.readdirSync(dataPath)) {
        if (file != 'dataRegistry.json' && registry.stored.includes(file)) {
            internalData.localData[1].push({ fileLocation: file, data: JSON.parse(fs.readFileSync(path.join(dataPath, file))) })
        } else if (file != 'dataRegistry.json' && registry.readonly.includes(file)) {
            internalData.localData[0].push({ fileLocation: file, data: JSON.parse(fs.readFileSync(path.join(dataPath, file))) })
        }
    }
}

function updateInfo(internalData) {
    const datOut = { stored: [], readonly: [] }
    internalData.localData[0].forEach(element => {
        if (element.fileLocation && element.data) {
            datOut.readonly.push(element.fileLocation)
        } else {
            error("Missing property fileLocation or data. (0)")
        }
    });
    internalData.localData[1].forEach(element => {
        if (element.fileLocation && element.data) {
            datOut.stored.push(element.fileLocation)
        } else {
            error("Missing property fileLocation or data. (1)")
        }
    });
    fs.writeFileSync(path.join(dataPath,'dataRegistry.json'),JSON.stringify(datOut))
    return datOut
}

function updateData(internalData) {
    internalData.localData[1].forEach(element => {
        if (element.fileLocation && element.data && element.fileLocation.length > 0) {
            fs.writeFileSync(path.join(dataPath, element.fileLocation), JSON.stringify(element.data))
        } else {
            error("Missing property fileLocation or data, or filename is empty.")
        }
    });
}

function cleanData(internalData) {
    const compareData = updateInfo(internalData)
    for (const file of fs.readdirSync(dataPath).filter(file => file.endsWith('.json'))) {
        if (file != 'dataRegistry.json' && !compareData.stored.includes(file) && !compareData.readonly.includes(file)) {
            fs.rmSync(path.join(dataPath, file))
        }
    }
}

const events = {
    [AvailableEvents.EventRegister]: async (client, internalData) => {
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath)
        }
        if (fs.existsSync(path.join(dataPath, 'dataRegistry.json'))) {
            loadData(internalData)
        }
        updateInfo(internalData)
        updateData(internalData)
        cleanData(internalData)
        internalData.updateLocal = function() {
            updateInfo(internalData)
            updateData(internalData)
        }
    }
}
const eventTypes = {
    [AvailableEvents.EventRegister]: 'once'
}

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {*} internalData 
     * @returns {Event}
     */
    register: function(client, internalData) {
        externalData = internalData
        return new Event(client, events, eventTypes, internalData, true, __filename)
    },
    order: 2
}