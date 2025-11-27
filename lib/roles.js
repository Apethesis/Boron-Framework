const ignoredHighRoles = {
    '1423882956849676342': true,
    '1423882956833030189': true,
    '1423882956820320275': true,
    '1423882956820320269': true,
    '1424286907038306374': true
}

function toUser(idormention) {
    if (!Number.isNaN(Number(idormention))) {
        return idormention
    } else {
        return idormention.substring(2,idormention.length-1)
    }
}
function toRole(idormention) {
    if (!Number.isNaN(Number(idormention))) {
        return idormention
    } else {
        return idormention.substring(3,idormention.length-1)
    }
}
async function createRoleArray(ouser, ignoredRoles) {
    const user = (await ouser.fetch())
    let midArray = []
    const topValue = user.roles.highest.position
    user.roles.cache.values().forEach((v) => { midArray[v.position] = v })
    midArray.reverse()
    const outArray = []
    for (const k in midArray) {
        if (!ignoredRoles[midArray[k].id]) {
            outArray.push(midArray[k])
        }
    }
    return outArray
}
async function resolveTop(user) {
    if (ignoredHighRoles[user.roles.highest.id]) {
        return new Promise((resolveOut) => {
            createRoleArray(user, ignoredHighRoles).then((res) => {
                resolveOut(res[0].id)
            })
        })
    } else {
        return new Promise((resolveOut) => {
            resolveOut(user.roles.highest.id)
        })
    }
}
async function checkHas(user, roleArray) {
    return new Promise((resolveOut) => {
        let state = false
        let role
        createRoleArray(user, {}).then((roles) => {
            for (const k in roles) {
                if (roleArray.includes(roles[k].id)) {
                    state = true
                    role = roles[k].id
                    break
                }
            }
            resolveOut([state, role])
        }) 
    })
}

module.exports = {
    toUser: toUser,
    toRole: toRole,
    createRoleArray: createRoleArray,
    resolveTop: resolveTop,
    checkHas: checkHas
}