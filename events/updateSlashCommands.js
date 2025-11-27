const { REST, Routes } = require('discord.js');
const { AvailableEvents } = require('../types/Events');
const { Event } = require('../classes/EventClass');
const path = require('node:path');
const fs = require('node:fs');
const rest = new REST().setToken(process.env.DTOK)
const parsedCommands = [];
let externalData

const events = {
    [AvailableEvents.ClientReady]: async (client) => {
        const altCommandsPath = path.join(__dirname, '../', 'slashCommands');
        for (const command of fs.readdirSync(altCommandsPath).filter(file => file.endsWith('.js'))) {
            const cmd = require(path.join(altCommandsPath, command))
            if (cmd['data'] && cmd['execute']) {
                parsedCommands.push(cmd.data.toJSON());
            }
        }
        try {
            await rest.put(Routes.applicationCommands(client.user.id), { body: parsedCommands });
            console.log(`Registered ${parsedCommands.length} slash commands successfully.`)
        } catch (error) {
            console.log(error)
            console.log("Failed to properly register slash commands, this may lead to issues.")
        }
    }
}
const eventTypes = {
    [AvailableEvents.ClientReady]: 'once'
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
    order: 0
}