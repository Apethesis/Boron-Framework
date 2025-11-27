async function exec(msg, args, internalData) {
    let res
    try {
        res = eval(msg.content.substring(6))
    } catch (err) {
        res = "errored"
    }
    if (!res || res.length < 1) { res = "empty response" }
    msg.reply(res).catch((err) => { console.log(err) })
}

module.exports = {
    command: 'eval',
    description: 'Evaluates my tomfoolery.',
    execute: exec,
    hidden: true,
    restricted: true, // If restricted is true, it takes into note the restrictions below. (usersAllowed, rolesAllowed)
    usersAllowed: [],
    rolesAllowed: []
}