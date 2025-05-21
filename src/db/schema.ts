import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';

export const playersTable = sqliteTable('players', {
  discordId: text('discord_id').notNull().primaryKey(),
  discordName: text('discord_name').notNull(),
});

export const scoresTable = sqliteTable('scores', {
  discordId: text('discord_id').notNull().references(() => playersTable.discordId),
  numberOfGames: integer('number_of_games').default(0),
  competitions: integer('competitions').default(0),
  totalAttempts: integer('total_attempts').default(0),
  attempts: integer('attempts').default(0),
  wins: integer('wins').default(0)
}, (table) => ({
  pk: primaryKey({ columns: [table.discordId] })
}));


export const scoresRelations = relations(scoresTable, ({ one }) => ({
  player: one(playersTable, {
    fields: [scoresTable.discordId],
    references: [playersTable.discordId]
  })
}));

export type InsertPlayer = typeof playersTable.$inferInsert;
export type SelectPlayer = typeof playersTable.$inferSelect;

export type InsertScore = typeof scoresTable.$inferInsert;
export type SelectScore = typeof scoresTable.$inferSelect;
export type SelectScoreWithRelations = SelectScore & { player: SelectPlayer };