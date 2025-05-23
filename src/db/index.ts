import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from "@libsql/client";
import { eq, and, sql, count } from "drizzle-orm";
import { playersTable, scoresTable, type SelectScoreWithRelations } from './schema';
import * as schema from './schema';
import { DiscordAPIError, discordSort } from 'discord.js';

const client = createClient({
  url: process.env.DB_FILE_NAME!,
  authToken: process.env.TURSO_TOKEN!
});
const db = drizzle(client, { schema });

export async function saveScore(attempts: number, discordId: string,): Promise<Boolean> {
  try {
    if (!await doesUserExistInScores(discordId)) {
      await db.insert(scoresTable).values({ discordId }).onConflictDoNothing();
    }

    await db.update(scoresTable).set({ attempts: sql`${scoresTable.attempts} + ${attempts.toString()}` }).where(eq(scoresTable.discordId, discordId));
    await db.update(scoresTable).set({ numberOfGames: sql`${scoresTable.numberOfGames} + 1`}).where(eq(scoresTable.discordId, discordId));
    await db.update(scoresTable).set({ totalAttempts: sql`${scoresTable.totalAttempts} + 1`}).where(eq(scoresTable.discordId, discordId));

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getScoreForUser(discordId: string): Promise<number[] | undefined> {
  try {
    const attemptsQuery = await db.select({ attempts: scoresTable.attempts, total_attempts: scoresTable.totalAttempts }).from(scoresTable).where(eq(scoresTable.discordId, discordId))
    const attempts = attemptsQuery[0].attempts;
    const totalAttempts = attemptsQuery[0].total_attempts;
    if (attempts == null || totalAttempts == null) {
      return undefined;
    }
    const attemptsPair = [attempts, totalAttempts];
    return attemptsPair;
  } catch (error) {
    return undefined;
  }
}

export async function clearAttemptsForAllPlayers(playerIds: string[]): Promise<boolean> {
  try {
    playerIds.forEach(async (id) => {
      await db.update(scoresTable).set({ attempts: 0, totalAttempts: 0 }).where(eq(scoresTable.discordId, id));
    })
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function doesUserExistInPlayers(discordId: string): Promise<boolean> {
  try {
    const countQuery = await db.select({ count: count() }).from(playersTable).where(eq(playersTable.discordId, discordId));
    return countQuery[0].count == 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function doesUserExistInScores(discordId: string): Promise<boolean> {
  try {
    const countQuery = await db.select({ count: count() }).from(scoresTable).where(eq(scoresTable.discordId, discordId));
    return countQuery[0].count == 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function setWeeklyStatsForAllPlayers(playerIds: string[]): Promise<boolean> {
  try {
    playerIds.forEach(async (id) => {
      await db.update(scoresTable).set({ competitions: sql`${scoresTable.competitions} + 1`}).where(eq(scoresTable.discordId, id));
    })
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function setWinner(discordId: string): Promise<boolean> {
  try {
    await db.update(scoresTable).set({ wins: sql`${scoresTable.wins} + 1`}).where(eq(scoresTable.discordId, discordId)); 
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function createPlayer(discordId: string, discordName: string): Promise<boolean> {
  try {
    if (await doesUserExistInPlayers(discordId)) return false
    await db.insert(playersTable).values({ discordId, discordName }).onConflictDoNothing();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
