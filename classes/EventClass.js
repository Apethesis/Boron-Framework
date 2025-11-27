const { Client } = require('discord.js');
const { EventsObject, EventTypesObject, AvailableEvents } = require("../types/Events");

class BCEvent {
    /**
     * Creates a new event.
     * @class
     * @param {Client} client 
     * @param {EventsObject} events 
     * @param {EventTypesObject} eventTypes
     * @param {*} internalData
     * @param {boolean} [reloadable=false]
     * @param {string} [fileName]
     */
    constructor(client, events, eventTypes, internalData, reloadable, fileName) {
        this.client = client;
        this.events = events;
        this.eventTypes = eventTypes;
        this.internalData = internalData;
        this.reloadable = reloadable;
        this.fileName = fileName;
        this.#state = 'loaded';
    }

    #state = 'unloaded';

    state() {
        return this.#state
    }

    kill() {
        let evCount = 0
        for (const ev in this.events) {
            if (this.eventTypes[ev] != 'once' && ev != AvailableEvents.EventRegister ) {
                this.client.removeListener(ev, this.events[ev])
            }
            evCount++
        }
        this.#state = 'dead';
        return evCount
    }

    restart() {
        this.kill()
        this.start()
    }

    start() {
        let evCount = 0
        for (const ev in this.events) {
            if (ev == AvailableEvents.EventRegister) {
                this.events[ev](this.client, this.internalData)
            } else {
                this.client[this.eventTypes[ev]](ev, this.events[ev])
            }
            evCount++
        }
        this.#state = 'active';
        return evCount
    }

    reload() {
        if (this.reloadable) {
            delete require.cache[this.fileName];
            return require(this.fileName).register(this.client, this.internalData)
        } else {
            throw new Error("Tried to reload a non-reloadable event.")
        }
    }
}

module.exports = {
    Event: BCEvent
}