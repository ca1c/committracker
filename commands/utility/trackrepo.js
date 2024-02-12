const { SlashCommandBuilder } = require('discord.js');
const Repo = require('../../Models/Repo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackrepo')
        .setDescription('Setup tracking for repository')
        .addStringOption(option => 
            option.setName('repolink')
                .setDescription('Link to github repository')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('channelid')
                .setDescription('Id of channel to post updates to')
                .setRequired(true)),
    async execute(interaction) {
        const repolink = interaction.options.getString('repolink');
        const channelId = interaction.options.getString('channelid');
        const guildId = interaction.guildId;

        const NewRepo = new Repo({
            url: repolink,
            guildId: guildId,
            channelId: channelId
        })

        try {
            await NewRepo.save();
        }
        catch(error) {
            console.error("Couldn't save new repo entry");
        }

        await interaction.reply(`Paste This Link: https://localhost:3000/webhook/${NewRepo._id}, in your github webhooks to start tracking`);
    }
};