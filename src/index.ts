import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import * as db from './db';
import { setupHotsdle, parseMessageForHotsdleResult, getLeaderboardMessage, getLeaderboard } from './hotsdle';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const currentDate = new Date();

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Logged in as ${readyClient.user?.tag}`);
  
    setupHotsdle(readyClient);
    // const guild = readyClient.guilds.cache.get('1362916522988802098'); // decca's dev
    // const messageChannel = readyClient.channels.cache.get('1362916522988802101') as TextChannel;
    //     messageChannel.send(`# HOTSdle Weekly\n:tada: Congratuations to , this week's HOTSdle champion with just  attempts! :tada:\n(you must play a lot with the fam)`)
    //     messageChannel.send('### New HOTSdle Weekly starts today!\n> [HOTSdle](https://hotsdle.zgame.studio/hero-guesser)!');

});

client.on(Events.MessageCreate, async (message) => {
  console.log(`${message.author.tag} said ${message.content}`);

  if (!client.user) return
  if (message.author.id === client.user.id) return

  const hotsdleResult = parseMessageForHotsdleResult(message.content);
  if (hotsdleResult != undefined) {
    const didSave = await db.saveScore(hotsdleResult, message.author.id);
    console.log(`Saving score: ${hotsdleResult} to ${message.author}`);
  }
  

  if (message.content.toLowerCase() == '!hotsdle') {
    sendHotsdleMessage(message);
  } else if (message.content.includes('I guessed the hero in #HotSdle in 2 tries (hero mode)')) {
    // var replyMesssage = "Not bad I guess."
    // switch (message.author.id) {
    //   case '128603266287140864': // justin
    //     replyMesssage = "Impressive, for a bronzey.";
    //     break;
    //   case '129053272018255872': // luke
    //     replyMesssage = "Now get 10k in cs2.";
    //     break;
    //   case '122600932469899264': // me
    //     replyMesssage = "Love that outta you."
    //     break;
    //   case '123666652150628353': // chai
    //     replyMesssage = "TFT really paying off.";
    //     break;
    //   case '128707792579198976': // devin
    //     replyMesssage = "TFT really paying off.";
    //     break;
    //   default:
    //     break;
    // }
    // message.channel.send(`<@${message.author.id}> ${replyMesssage}`);
  } else if (message.content.includes('I guessed the hero in #HotSdle for the first try (hero mode)')) {
    message.channel.send(`<@${message.author.id}> Now go open a case.`);
  } else if (message.content == '!leaderboard' || message.content == '!lb') {
    const leaderboard = await getLeaderboard();
    message.channel.send(getLeaderboardMessage(leaderboard));
  }
});

async function sendHotsdleMessage(message: any) {
    message.channel.send(`
        <@${message.author.id}> asuh dud:\nhttps://hotsdle.zgame.studio/hero-guesser`);
}


await client.login(process.env.DISCORD_BOT_TOKEN);
