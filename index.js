require('dotenv').config();
const { Client, Events, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const { checkHas } = require("./lib/roles");
const { checkCommand } = require("./lib/typechecking");
const fs = require('fs');
const path = require('node:path');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const internalData = {
    client: client,
    prefix: '>',
    rootDir: __dirname,
    env: process.env,
    commands: new Collection(),
    slashCommands: new Collection(),
    aliases: new Collection(),
    lib: {},
    localData: [ [], [] ], // 0 : read-only, 1 : read-write, { fileLocation: '', data: {} }
    registeredEvents: [], // collection of Events in loaded order
    eventInfo: [], // an unfortunate but needed one, to track the filenames of events
    enabledEventData: JSON.parse(fs.readFileSync(path.join(__dirname, 'enabledEvents.json')))
};

const libraryPath = path.join(__dirname, 'events');
for (const lib of fs.readdirSync(libraryPath).filter(file => file.endsWith('.js'))) {
    internalData.lib[lib] = require(path.join(libraryPath, lib))
}
console.log(`Loaded all libraries.`)

const eventsPath = path.join(__dirname, 'events');
let eventOrder = []
for (const event of fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))) {
    const ev = require(path.join(eventsPath, event));
    eventOrder[ev.order] = ev.register
    internalData.eventInfo[ev.order] = event
}
eventOrder.forEach((ev, idx) => {
    internalData.registeredEvents.push(ev(client, internalData))
    if (internalData.enabledEventData.data[idx]) {
        internalData.registeredEvents.at(-1).start()
    } else if (typeof internalData.enabledEventData.data[idx] != 'boolean') {
        internalData.enabledEventData.data[idx] = true
        internalData.registeredEvents.at(-1).start()
        fs.writeFileSync(path.join(__dirname, 'enabledEvents.json'), JSON.stringify(internalData.enabledEventData))
    }
})
console.log(`Registered ${eventOrder.length} events successfully.`)

const commandsPath = path.join(__dirname, 'commands');
for (const command of fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))) {
    const cmd = require(path.join(commandsPath, command))
    internalData.commands.set(internalData.prefix+cmd.command, cmd);
    if (cmd.aliases) {
        cmd.aliases.forEach((elm) => {
            internalData.aliases.set(internalData.prefix+elm, internalData.prefix+cmd.command)
        })
    }
    if (cmd.setup) {
        cmd.setup(internalData);
    }
}
console.log(`Loaded ${internalData.commands.size} commands successfully.`)

const altCommandsPath = path.join(__dirname, 'slashCommands');
for (const command of fs.readdirSync(altCommandsPath).filter(file => file.endsWith('.js'))) {
    const cmd = require(path.join(altCommandsPath, command))
    if (cmd['data'] && cmd['execute']) {
        internalData.slashCommands.set(cmd.name, cmd);
    }
}
console.log(`Loaded ${internalData.slashCommands.size} slash commands successfully.`)

client.once(Events.ClientReady, async () => {
    console.log("Ready to go bawss!")
})

client.on(Events.MessageCreate, async (msg) => {
    const args = msg.content.split(" ")
    if (internalData.aliases.get(args[0])) {
        args[0] = internalData.aliases.get(args[0])
    }
    const command = internalData.commands.get(args[0]) || internalData.commands.get(args[0].toLowerCase())
    if (command) {
        try {
            if (command.argumentTypes) {
                const typeStatus = checkCommand(msg, command.argumentTypes)
                const valid = typeStatus[0]; const errPosition = typeStatus[1]; const errType = typeStatus[2]
                if (!valid) {
                    msg.reply(`Failed to validate command, incorrect format at argument ${errPosition}. Expected type: ${errType}.`)
                    return
                }
            }
            if (command.restricted && ((command.usersAllowed && command.usersAllowed.includes(msg.author.id)) || (command.rolesAllowed && (await checkHas(msg.member,command.rolesAllowed))[0]) || (command.minimumRole && msg.member.roles.highest.comparePositionTo(command.minimumRole) >= 0))) {
                command.execute(msg, args, internalData)
            } else if (!command.restricted) {
                command.execute(msg, args, internalData)
            }
        } catch (error) {
            msg.reply("Caught error while running command, please inform your local Administrator.")
            console.log(error)
        }
    }
})

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = internalData.slashCommands.get(interaction.commandName);

    if (!command) {
        interaction.reply({ flags: MessageFlags.Ephemeral, content: 'Command not found, how did we get here?' });
        return
    }
    try {
        await command.execute(interaction, internalData)
    } catch (error) {
        interaction.reply({ flags: MessageFlags.Ephemeral, content: "Caught error while running command, please inform your local Administrator." })
        console.log(error)
    }
})

client.login(process.env.DTOK)