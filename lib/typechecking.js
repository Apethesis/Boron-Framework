const { toUser, toRole } = require("./roles");
const validateUUID = require('uuid-validate');

const isNaN = Number.isNaN;

const typecheckers = { // arg = string, msg = Message, argCount = number (starts from 1)
    discordUser: function(arg) {
        return !isNaN(Number(toUser(arg)))
    },
    discordRole: function(arg) {
        return !isNaN(Number(toRole(arg)))
    },
    extendedString: function(arg, msg, position) {
        const split = msg.content.split(" ")
        let startPoint = 0
        split.forEach((element, k) => { if (k < position) { startPoint = startPoint + element.length + 1 } });
        return msg.content.substring(startPoint).length > 0
    },
    botctlAction: function(arg) {
        const matches = [ 'stop', 'start', 'restart', 'reload', 'enable', 'disable', 'cycle', 'list' ]
        return matches.includes(arg)
    },
    setOrGet: function(arg) {
        return arg === 'set' || arg === 'get'
    }
}
const primitives = {
    "string": (arg) => { return typeof arg === "string" },
    "number": (arg) => { return !isNaN(Number(arg)) },
    "boolean": (arg) => { return arg === "true" || arg === "false" },
    "bigint": (arg) => { let status = true; try { BigInt(arg) } catch { status = false; } return status; }
}

function checkCommand(msg, typeTable) {
    let valid = true
    const args = msg.content.split(" ")
    let extPosition, extType
    typeTable.forEach((val, k) => {
        if (!valid) return; 
        const position = k+1
        if (typeTable[k].optional && !args[position]) {
            valid = true
        } else if (typeTable[k].type != 'null' && typeTable[k].type != 'undefined' && !args[position]) {
            valid = false
        } else if (primitives[typeTable[k].type]) {
            valid = primitives[typeTable[k].type](args[position])
        } else if (typecheckers[typeTable[k].type]) {
            valid = typecheckers[typeTable[k].type](args[position], msg, position)
        }
        if (!valid) extPosition = position; extType = typeTable[k].type; return;
    })
    return [valid, extPosition, extType]
}

module.exports = {
    checkCommand: checkCommand
}