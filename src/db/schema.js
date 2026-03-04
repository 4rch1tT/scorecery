import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  pgEnum,
  jsonb,
  text,
} from "drizzle-orm/pg-core";

// Define match_status enum
export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  sport: varchar("sport", { length: 50 }).notNull(),
  homeTeam: varchar("home_team", { length: 100 }).notNull(),
  awayTeam: varchar("away_team", { length: 100 }).notNull(),
  status: matchStatusEnum("status").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Commentary table
export const commentary = pgTable("commentary", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  minute: integer("minute"),
  sequence: integer("sequence"),
  period: varchar("period", { length: 20 }),
  eventType: varchar("event_type", { length: 50 }),
  actor: varchar("actor", { length: 100 }),
  team: varchar("team", { length: 100 }),
  message: text("message"),
  metadata: jsonb("metadata"),
  tags: varchar("tags", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
