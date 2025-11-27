async function exec(msg, args, internalData) {
    msg.reply("Miaou.")
}

module.exports = {
    command: 'test',
    description: 'Does testy things',
    execute: exec,
    hidden: false,
    restricted: false, // If restricted is true, it takes into note the restrictions below. (usersAllowed, rolesAllowed)
    usersAllowed: [],
    rolesAllowed: []
}