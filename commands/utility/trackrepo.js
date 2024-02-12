const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackrepo')
        .setDescription('Setup tracking for repository')
        .addStringOption(option => 
            option.setName('repolink')
                .setDescription('Link to github repository')
                .setRequired(true)),
    async execute(interaction) {
        const repolink = interaction.options.getString('repolink');

        await interaction.reply(`Paste This Link: ${repolink}, in your github webhooks to start tracking`);
    }
};