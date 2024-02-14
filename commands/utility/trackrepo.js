const { SlashCommandBuilder } = require('discord.js');
const Repo = require('../../Models/Repo');
const http = require('http');

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

        const options = {
          host: 'api.ipify.org',
          port: 80,
          path: '/?format=json'
        };

        const req = http.request(options, (res) => {
          res.setEncoding('utf8');

          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });

          // When the response completes, parse the JSON and log the IP address
          res.on('end', async () => {
            const data = JSON.parse(body);

            await interaction.reply(`Paste This Link: http://${data.ip}:${process.env.PORT}/webhook/${NewRepo._id}, in your github webhooks to start tracking`);
          });
        });

        // Send the request
        req.end();
    }
};