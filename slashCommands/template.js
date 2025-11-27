const { SlashCommandBuilder } = require('discord.js');

async function exec(interaction, internalData) {
    interaction.reply("Miaou.")
}

module.exports = {
    name: 'test',
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Does testy things'),
    execute: exec
}