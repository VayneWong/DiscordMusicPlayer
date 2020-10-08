const Discord = require('discord.js');
const { processMusicRequest } = require('./MusicArea');
const bot = new Discord.Client();

const Channel = {
    music: 'music-area'
}

const BotName = 'vayne_test_app';

bot.once('ready', () => {
    console.log('ready!');
})

bot.on('message', async (userMessage) => {
    if (userMessage.channel.name === Channel.music && userMessage.author.username !== BotName) {
        await processMusicRequest(userMessage);
    }
});


bot.login('your-token-here');
