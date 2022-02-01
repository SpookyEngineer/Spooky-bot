//Requires node ver 16 or above
const Discord = require("discord.js");
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const {token} = require('./config.json');
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

const { joinVoiceChannel,
        getVoiceConnection, 
        createAudioPlayer, 
        createAudioResource,
        AudioPlayerStatus 
} = require('@discordjs/voice');


const player = createAudioPlayer();

// Functions that execute on message content
client.on("messageCreate", message => {
    if(message.author.bot) return

    // Music Player
    if(message.content.includes("!play ")){

        if (!message.member.voice.channel) return message.channel.send('You need to be a voice channel to execute this command!')
        if(!message.member.voice.channel.joinable) return message.channel.send('I need permission to join your voice channel!')
        
        const url = message.content.replace("!play ", "")
        const stream = ytdl(url);
        const resource = createAudioResource(stream)

        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })
        // Plays song (Requires FFmpeg)
        message.channel.send("Playing song!")
        player.play(resource);
        connection.subscribe(player);
        
        player.on("error", () => message.channel.send("There was an error"));
    }
    // Lofi player
    if(message.content.includes("!lofi")){

        if (!message.member.voice.channel) return message.channel.send('You need to be a voice channel to execute this command!')
        if(!message.member.voice.channel.joinable) return message.channel.send('I need permission to join your voice channel!')
        
        const lofiUrls = ["https://www.youtube.com/watch?v=lTRiuFIWV54&",
                          "https://www.youtube.com/watch?v=W6YI3ZFOL0A&",
                          "https://www.youtube.com/watch?v=FFfdyV8gnWk",
                          "https://www.youtube.com/watch?v=ldUT4FLxql4&",
                          "https://www.youtube.com/watch?v=qCa64XOO5Ng",
                          "https://www.youtube.com/watch?v=uzX6Mu-sCfA",
                          "https://www.youtube.com/watch?v=dLmyp3xMsAo"]

        const randomLofi = lofiUrls[Math.floor(Math.random() * lofiUrls.length)]
        const stream = ytdl(randomLofi);
        console.log("Now playing " + randomLofi)
        const resource = createAudioResource(stream);

        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })
        // Plays song (Requires FFmpeg)
        message.channel.send("Playing lofi!")
        player.play(resource);
        connection.subscribe(player);
        
        // Plays random from lofiUrls on player idle
        player.on(AudioPlayerStatus.Idle, () => {
            const randomLofi = lofiUrls[Math.floor(Math.random() * lofiUrls.length)]
            const stream = ytdl(randomLofi);
            console.log("Now playing " + randomLofi)
            const resource = createAudioResource(stream);
            player.play(resource);
        });

        player.on("error", () => console.log("There was an error"));
    }

    if(message.content.startsWith("!pause")){
        const connection = getVoiceConnection(message.guild.id)
        if(!connection) return message.channel.send("I'm not in a voice channel!")
        player.pause();
        console.log('Paused')
    }
    if(message.content.startsWith("!unpause")){
        const connection = getVoiceConnection(message.guild.id)
        if(!connection) return message.channel.send("I'm not in a voice channel!")
        player.unpause();
        console.log('Unpaused')
    }

    if(message.content.startsWith("!leave")){
        const connection = getVoiceConnection(message.guild.id)
        if(!connection) return message.channel.send("I'm not in a voice channel!")
        connection.destroy()
        console.log('Disconnected from voice!')
    }

    if(message.content === "ping"){
        message.reply("pong")
    }
    if(message.content === "pong"){
        message.reply("ping")
    }

    if(message.content === "F" || message.content === "f") {
        message.reply("You have payed respects")
      }

    if(message.content.startsWith("!inspire")){
        getQuote().then(quote => message.channel.send(quote))
    }
})

// Fetches random quote from api
function getQuote(){
    return fetch("https://zenquotes.io/api/random")
    .then(response => response.json())
    .then(data => {
        return data[0]["q"] + " -" + data[0]["a"]
    }).catch(message.channel.send("There was an error"))
}
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.login(token)