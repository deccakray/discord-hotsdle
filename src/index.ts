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

    //  '00 30 10 * * *' 10:30
    let scheduledMessage = new cron.CronJob('00 02 15 * * *', () => {
      const guild = readyClient.guilds.cache.get('273575846609027083'); // Decca's Den
       if (!guild) {
        console.log("No guild found!");
        return;
      }

      const messageChannel = readyClient.channels.cache.get('440677199230533633') as TextChannel;
      if (!messageChannel) {
        console.log("messageChannel undefined");
        return;
      }
      messageChannel.send('@here Daily [HOTSdle](https://hotsdle.zgame.studio/hero-guesser)!');
    });
          
    scheduledMessage.start()

    // const guild = readyClient.guilds.cache.get('1362916522988802098'); // decca's dev
    // const messageChannel = readyClient.channels.cache.get('1362916522988802101') as TextChannel;
    // messageChannel.send('@here Daily [HOTSdle](https://hotsdle.zgame.studio/hero-guesser)!')
});

client.on(Events.MessageCreate, async (message) => {
  console.log(`${message.author.tag} said ${message.content}`);

  if (!client.user) return
  if (message.author.id === client.user.id) return
  if (message.content.toLowerCase() == 'hotsdle me') {
    sendHotsdleMessage(message);
  } else if (message.content.includes('I guessed the hero in #HotSdle in 2 tries (hero mode)')) {
    var replyMesssage = "Not bad I guess."
    switch (message.author.id) {
      case '128603266287140864': // justin
        replyMesssage = "Impressive, for a bronzey.";
        break;
      case '129053272018255872': // luke
        replyMesssage = "Now get 10k in cs2.";
        break;
      case '122600932469899264': // me
        replyMesssage = "Love that outta you."
        break;
      case '123666652150628353': // chai
        replyMesssage = "TFT really paying off.";
        break;
      case '128707792579198976': // devin
        replyMesssage = "TFT really paying off.";
        break;
      default:
        break;
    }
    message.channel.send(`<@${message.author.id}> ${replyMesssage}`);
  } else if (message.content.includes('I guessed the hero in #HotSdle in 1 tries (hero mode)')) {
    message.channel.send(`<@${message.author.id}> Now go open a case.`);
  }
});

async function sendHotsdleMessage(message: any) {
    message.channel.send(`
        <@${message.author.id}> asuh dud:\nhttps://hotsdle.zgame.studio/hero-guesser`);
}


await client.login(process.env.DISCORD_BOT_TOKEN);