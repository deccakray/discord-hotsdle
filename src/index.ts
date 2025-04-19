import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const cron = require('cron');

const currentDate = new Date();


client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Logged in as ${readyClient.user?.tag}`);

     //'00 30 10 * * *' 10:30
    let scheduledMessage = new cron.CronJob('00 25 22 * * *', () => {
    // This runs every day at 10:30:00, you can do anything you want
    const guild = readyClient.guilds.cache.first();
    const channel = guild?.channels.cache.find(channel => channel.name == 'stinger_gang');
    if (!channel) {
        console.log("No channel found!");
        return;
    }

    const messageChannel = readyClient.channels.cache.get(channel.id) as TextChannel;
    if (!messageChannel) {
        console.log("messageChannel undefined");
        return;
    }
    messageChannel.send('@here Daily HOTSdle!\nhttps://hotsdle.zgame.studio/hero-guesser');
    });
          
    // When you want to start it, use:
    scheduledMessage.start()
});

client.on(Events.MessageCreate, async (message) => {
  console.log(`${message.author.tag} said ${message.content}`);

  if (!client.user) return
  if(message.author.id === client.user.id) return
  if (message.content.toLowerCase().includes('hotsdle')) {
    sendHotsdleMessage(message);
  }
});

async function sendHotsdleMessage(message: any) {
    message.channel.send(`
        <@${message.author.id}> asuh dud:\nhttps://hotsdle.zgame.studio/hero-guesser`);
}


await client.login(process.env.DISCORD_BOT_TOKEN);