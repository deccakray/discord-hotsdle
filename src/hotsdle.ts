import * as db from './db';
import { Client, TextChannel } from 'discord.js';

const cron = require('cron');

const stingerGang: [string, string][] = [
    ['128603266287140864', 'Llamarama'], // justin
    ['129053272018255872', 'iWalkonskies'], // luke
    ['128707792579198976', 'snarf'], // devin
    ['123666652150628353', 'CHAI'], // chai
    ['122600932469899264', 'decca'] // decca
]

export async function setupHotsdle(readyClient: Client) {
    addStingerGangUsers();
    dailyHotsdleJob(readyClient);
    weeklyHotsdleCompetitionJob(readyClient);
}

export function parseMessageForHotsdleResult(content: string): number | undefined {
  var score = undefined;
  if (content.includes('I guessed the hero in #HotSdle') && content.includes('(hero mode)')) {
    if (content.includes("first")) {
        score = 1;
    } else {
        const splitContent = content.split(" ");
        let scoreString = splitContent[7];
        score = +scoreString;
    }
  }
  return score;
}

async function weeklyHotsdleCompetitionJob(readyClient: Client) {
    let scheduledMessage = new cron.CronJob('00 02 15 * * 1', async () => {
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

      const leaderboard = await getLeaderboard();

      const noAttempts = leaderboard.every(attempts => attempts[1] == 0)
      if (!noAttempts) {
        messageChannel.send(getWeeklyWinnerMessage(leaderboard));
        updateStatsAfterCompetition(leaderboard[0][0])
        messageChannel.send('### New HOTSdle Weekly starts today!\n> [HOTSdle](https://hotsdle.zgame.studio/hero-guesser)!');
      }
    });
          
    scheduledMessage.start()
}

async function dailyHotsdleJob(readyClient: Client) {
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
}

async function updateStatsAfterCompetition(winnerId: string) {
    await db.setWinner(winnerId);
    const stingerIds = stingerGang.map((player: [string, string]) => { return player[0]; });
    db.setWeeklyStatsForAllPlayers(stingerIds);
    db.clearAttemptsForAllPlayers(stingerIds);
}

export async function getLeaderboard(): Promise<[string, number][]> {
    const leaderboard: [string, number][] = [];

    for (const [id, name] of stingerGang) {
        const score = await db.getScoreForUser(id)
        if (score != undefined) {
            leaderboard.push([id, score]);
        } else {
            leaderboard.push([id, 0]);
        }
    }

    return leaderboard.sort((a, b) => a[1] - b[1]);
}

export function getLeaderboardMessage(leaderboard: [string, number][]): string {
    const leaderboardRankingString = leaderboard.map((ranking: [string, number], index) => {
        const rank = (index + 1).toString();
        return `${rank}. <@${ranking[0]}> (${ranking[1]} total attempts)`;
    }).join("\n")
    return ":first_place: Current **HotSdle Weekly** Power Rankings! :first_place:\n" + leaderboardRankingString;
}

function getWeeklyWinnerMessage(leaderboard: [string, number][]): string {
    const winner = leaderboard[0];
    const runnerUps = leaderboard.slice(1)

    const messageOne = `# HOTSdle Weekly\n:tada: Congratuations to <@${winner[0]}>, this week's HOTSdle champion with just ${winner[1]} attempts! :tada:\n(you must play a lot with the fam)`;
    const messageTwo = `\nJust not good enough:\n` + runnerUps.map((ranking: [string, number], index) => {
        const rank = (index + 2).toString();
        return `${rank}. <@${ranking[0]}> (${ranking[1]} total attempts)`;
    }).join("\n")

    return messageOne + `\n` + messageTwo;
}

async function addStingerGangUsers() {
    for (const [id, name] of stingerGang) {
        const didCreateUser = await db.createPlayer(id, name);
        if (didCreateUser) {
            console.log("Added " + name + "!");
        } else {
            console.log("Failed to add " + name);
        }
    }
}