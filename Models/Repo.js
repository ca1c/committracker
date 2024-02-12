const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema({
    url: {required: true, lowercase: true, type: String},
    guildId: {required: true, type: String},
    channelId: {required: true, type: String},
});

const Repo = mongoose.model('Repo', repoSchema, 'repos');

module.exports = Repo;