const ytdl = require('ytdl-core');

async function processMusicRequest(userMessage) {
    let deletedBotMessage = undefined;
    if (ytdl.validateURL(userMessage.content)) {
        const botMessage = await userMessage.channel.send('song will add into list');
        deletedBotMessage = botMessage.delete({ timeout: 3000 });
        playMusic(userMessage.content, userMessage);
    } else if (userMessage.content === 'skip') {
        skipMusic(userMessage);
    } else if (userMessage.content === 'stop') {
        stopMusic(userMessage);
    } else {
        console.log(`${userMessage.content}`, 'song or command not able to exec');
    }
    const deletedUserMessage = userMessage.delete({ timeout: 3000 });
    const result = await Promise.all([deletedUserMessage, deletedBotMessage]);
    for (let index = 0; index < result.length; index++) {
        const message = result[index];
        if (message) {
            console.log(`Deleted message from ${message.author.username} after 3 seconds`)
        }
    }
}

let dispatcher = undefined;
let songStreamList = [];

async function skipMusic(userMessage) {
    if (songStreamList.length) {
        const songStream = songStreamList.shift();
        nextMusic(songStream, userMessage);
    } else {
        console.log('no song to skip');
    }
}

async function stopMusic(userMessage) {
    songStreamList = [];
    const voiceChannel = userMessage.member.voice.channel;
    voiceChannel.leave();
    dispatcher = undefined;
}

async function nextMusic(stream, userMessage) {
    const voiceChannel = userMessage.member.voice.channel;
    const connection = await voiceChannel.join();

    dispatcher = connection.play(stream);
    dispatcher.on('finish', function () {
        if (songStreamList.length) {
            const songStream = songStreamList.shift();
            nextMusic(songStream, userMessage);
        } else {
            voiceChannel.leave();
            dispatcher = undefined;
        }
    });
}

async function playMusic(url, userMessage) {
    const stream = await ytdl(url, { filter: 'audioonly' });
    if (dispatcher === undefined) {
        nextMusic(stream, userMessage);
    } else {
        songStreamList.push(stream);
        console.log('song list', songStreamList.length);
    }
}

exports.processMusicRequest = processMusicRequest;