async function exec(msg, args, internalData) {
    let outputMsg = "Available commands:```\n"
    internalData.commands.forEach((cmd) => {
        if (!cmd.hidden) {
            let cmdArgs = ""
            if (cmd.argumentTypes) {
                cmdArgs = cmdArgs + " ("
                cmd.argumentTypes.forEach((v,k) => {
                    cmdArgs = cmdArgs + (v.name || v.type)
                    if (v.optional) {
                        cmdArgs = cmdArgs + "?"
                    }
                    if (cmd.argumentTypes[k+1]) {
                        cmdArgs = cmdArgs + ', '
                    }
                })
                cmdArgs = cmdArgs + ")"
            }
            outputMsg = `${outputMsg}${internalData.prefix}${cmd.command}${cmdArgs} - ${cmd.description}\n`
        }
    })
    outputMsg = outputMsg+'```'
    msg.reply(outputMsg)
}

module.exports = {
    command: 'help',
    description: 'Shows available commands.',
    execute: exec,
    restricted: false, // If restricted is true, it takes into note the restrictions below. (usersAllowed, rolesAllowed)
    usersAllowed: [],
    rolesAllowed: []
}