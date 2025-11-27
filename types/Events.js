const { Events } = require('discord.js');

const BFEvents = {
    EventRegister: 'onRegister'
}

module.exports = {
    AvailableEvents: {
        ...Events,
        ...BFEvents
    }
}