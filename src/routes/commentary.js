import { Router } from "express";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { matchIdParamSchema } from "../validation/matches.js";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get("/", async (req, res) => {
  // Validate matchId param
  const paramParse = matchIdParamSchema.safeParse(req.params);
  if (!paramParse.success) {
    return res.status(400).json({
      error: "Invalid match id",
      details: paramParse.error.issues,
    });
  }

  // Validate query
  const queryParse = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryParse.success) {
    return res.status(400).json({
      error: "Invalid query",
      details: queryParse.error.issues,
    });
  }

  const limit = Math.min(queryParse.data.limit ?? MAX_LIMIT, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(commentary)
      .where(commentary.matchId.eq(paramParse.data.id))
      .orderBy(commentary.createdAt.desc())
      .limit(limit);
    res.status(200).json({ data });
  } catch (error) {
    console.error("Failed to fetch commentary:", error);
    res.status(500).json({
      error: "Failed to fetch commentary.",
      details: error.message || error.toString(),
    });
  }
});

commentaryRouter.post("/", async (req, res) => {
  // Validate matchId param
  const paramParse = matchIdParamSchema.safeParse(req.params);
  if (!paramParse.success) {
    return res.status(400).json({
      error: "Invalid match id",
      details: paramParse.error.issues,
    });
  }

  // Validate commentary body
  const bodyParse = createCommentarySchema.safeParse(req.body);
  if (!bodyParse.success) {
    return res.status(400).json({
      error: "Invalid commentary payload",
      details: bodyParse.error.issues,
    });
  }

  try {
    const values = {
      matchId: paramParse.data.id,
      minute: bodyParse.data.minute,
      sequence: bodyParse.data.sequence,
      period: bodyParse.data.period,
      eventType: bodyParse.data.eventType,
      actor: bodyParse.data.actor,
      team: bodyParse.data.team,
      message: bodyParse.data.message,
      metadata: bodyParse.data.metadata,
      tags: bodyParse.data.tags ? bodyParse.data.tags.join(",") : null,
    };
    const [result] = await db.insert(commentary).values(values).returning();

    if (res.app.locals.broadcastCommentary) {
      res.app.locals.broadcastCommentary(result.matchId, result);
    }
    res.status(201).json({ data: result });
  } catch (error) {
    console.error("Failed to create commentary:", error);
    res.status(500).json({
      error: "Failed to create commentary.",
      details: error.message || error.toString(),
    });
  }
});
