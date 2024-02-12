const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Repo = require('./Models/Repo');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for(const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing arequired "data" or "execute" property.`);
        }
    }
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const app = express();
    const port = 3000;

    app.use(bodyParser.json());

    app.get("/", (req, res) => {
        res.send("connected");
    })

    app.post('/webhook/:repoId', async (req, res) => {
        const repoId = req.params.repoId;
        const payload = req.body;
        const repo = await Repo.findOne({_id: repoId});

        if(!repo) {
            res.status(500).end();
            return;
        }
        
        const targetChannel = client.channels.cache.get(repo.channelId);
        console.log(targetChannel);
        

        if(payload && targetChannel) {
            console.log(payload);
            targetChannel.send("commit received!");
        }

        res.status(200).end();
    })

    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    })
});

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch(error) {
        console.error(error);
        if(interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

    console.log(interaction);
})


// Mongoose stuff

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9csfneq.mongodb.net/?retryWrites=true&w=majority`);
}


//Express stuff


// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);