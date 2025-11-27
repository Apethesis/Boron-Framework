const fs = require('fs');
const path = require('node:path');

async function exec(msg, args, internalData) {
    let res
    switch (args[1]) {
        case 'list':
            let outStr = 'Current existing events: ```\n'
            internalData.eventInfo.forEach((element, k) => {
                outStr = outStr+`${k}: ${element} (${internalData.registeredEvents[k].state()})\n`
            });
            outStr = outStr + '```'
            msg.reply(outStr)
            break;
        case 'start':
            try {
                res = internalData.registeredEvents[Number(args[2])].start()
            } catch (error) {
                res = error
            }
            if (typeof res == 'number') {
                msg.reply(`Successfully started event.`)
            } else {
                msg.reply(`Invalid response, event may have failed to start.`)
            }
            break;
        case 'stop':
            try {
                res = internalData.registeredEvents[Number(args[2])].kill()
            } catch (error) {
                res = error
            }
            if (typeof res == 'number') {
                msg.reply(`Successfully stopped event.`)
            } else {
                msg.reply(`Invalid response, event may have failed to stop.`)
            }
            break;
        case 'restart':
            try {
                internalData.registeredEvents[Number(args[2])].restart()
            } catch (error) {
                res = error
            }
            if (res) {
                msg.reply(`Invalid response, event may have failed to restart.`)
            } else {
                msg.reply(`Attemped to restart event.`)
            }
            break;
        case 'reload':
            try {
                const ores = internalData.registeredEvents[Number(args[2])].reload()
                internalData.registeredEvents[Number(args[2])] = ores
            } catch (error) {
                res = error
            }
            console.log(res)
            if (res) {
                msg.reply(`Failed to reload, likely due to the event being non-reloadable.`)
            } else {
                msg.reply(`Reloaded event, you may need to start it now.`)
            }
            break;
        case 'enable':
            internalData.enabledEventData.data[Number(args[2])] = true
            fs.writeFileSync(path.join(__dirname, '../', 'enabledEvents.json'), JSON.stringify(internalData.enabledEventData))
            msg.reply('Enabled event.')
            break;
        case 'disable':
            internalData.enabledEventData.data[Number(args[2])] = false
            fs.writeFileSync(path.join(__dirname, '../', 'enabledEvents.json'), JSON.stringify(internalData.enabledEventData))
            msg.reply('Disabled event.')
            break;
        case 'cycle':
            try {
                res = internalData.registeredEvents[Number(args[2])].kill()
                const ores = internalData.registeredEvents[Number(args[2])].reload()
                internalData.registeredEvents[Number(args[2])] = ores
                res = internalData.registeredEvents[Number(args[2])].start()

            } catch (error) {
                res = error
            }
            console.log(res)
            if (res) {
                msg.reply(`Failed to cycle, likely due to the event being non-reloadable.`)
            } else {
                msg.reply(`Cycled event.`)
            }
            break;
        default:
            msg.reply(`Invalid request, how did we get here?`)
            break;
    }
}

module.exports = {
    command: 'botctl',
    description: 'Bot event controller.',
    argumentTypes: [{ type: 'botctlAction' }, { type: 'number', optional: true, name: 'event' }],
    execute: exec,
    hidden: true,
    restricted: true, // If restricted is true, it takes into note the restrictions below. (usersAllowed, rolesAllowed)
    usersAllowed: [],
    rolesAllowed: []
}