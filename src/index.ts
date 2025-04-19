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
    let scheduledMessage = new cron.CronJob('00 46 05 * * *', () => {
    // This runs every day at 10:30:00, you can do anything you want
      const guild = readyClient.guilds.cache.find(guild => guild.name == 'Decca\'s Den');
      if (!guild) {
        console.log("No guild found!");
        return;
      }

      const messageChannel = readyClient.channels.cache.get('440677199230533633') as TextChannel;
      if (!messageChannel) {
        console.log("messageChannel undefined");
        return;
      }
      messageChannel.send('@here Daily HOTSdle!\nhttps://hotsdle.zgame.studio/hero-guesser');
    });
          
    scheduledMessage.start()
});

client.on(Events.MessageCreate, async (message) => {
  console.log(`${message.author.tag} said ${message.content}`);

  if (!client.user) return
  if(message.author.id === client.user.id) return
  if (message.content.toLowerCase() == 'hotsdle me') {
    sendHotsdleMessage(message);
  }
});

async function sendHotsdleMessage(message: any) {
    message.channel.send(`
        <@${message.author.id}> asuh dud:\nhttps://hotsdle.zgame.studio/hero-guesser`);
}


await client.login(process.env.DISCORD_BOT_TOKEN);