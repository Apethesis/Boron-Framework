const { findFirst, isJSON } = require("../lib/utility");

async function exec(msg, args, internalData) {
    switch (args[1]) {
        case 'set':
            const stringPoint = args[0].length + args[1].length + args[2].length + 3
            if (isJSON(msg.content.substring(stringPoint))) {
                const res = findFirst(internalData.localData[1], 'fileLocation', args[2])
                if (res) {
                    internalData.localData[1][res[1]].data = JSON.parse(msg.content.substring(stringPoint))
                    internalData.updateLocal()
                    msg.reply(`Set data to new value.`)
                } else {
                    msg.reply(`I genuinely can't get myself to make file creation right now, sorry twin.`)
                }
            } else {
                msg.reply("Invalid JSON.")
            }
            break;
        case 'get':
            const res = findFirst(internalData.localData[1], 'fileLocation', args[2])
            if (res) {
                msg.reply('```json\n'+JSON.stringify(internalData.localData[1][res[1]].data)+'```')
            } else {
                msg.reply(`Couldn't find file of that name.`)
            }
            break;
        default:
            msg.reply(`Invalid request, how did we get here?`)
            break;
    }
}

module.exports = {
    command: 'localdata',
    description: 'Local data editor.',
    argumentTypes: [{ type: 'setOrGet' }, { type: 'string', name: 'dataFile' }, { type: 'extendedString', optional: true, name: 'data' }],
    execute: exec,
    hidden: true,
    restricted: true, // If restricted is true, it takes into note the restrictions below. (usersAllowed, rolesAllowed)
    usersAllowed: [],
    rolesAllowed: []
}