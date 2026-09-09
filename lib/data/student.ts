import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { publicConfig } from "./config";
import { database } from "./server";
import { prepareSkill } from "./catalog";
import type {
  Attempt,
  Mastery,
  Streak,
  ShelterState,
} from "@/lib/engine/types";
import { selectDaily } from "@/lib/engine/selector";
import {
  dayKey,
  completeStreak,
  updateMastery,
  visibleStreak,
} from "@/lib/engine/mastery";
import { evaluate, exerciseFor } from "@/lib/engine/exercises";
import type { ShelterCat } from "./shelter";
export const studentClient = cache(async () => {
  const { url, key } = publicConfig();
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = process.env.LAURA_EMAIL,
    password = process.env.LAURA_PASSWORD;
  if (!email || !password) throw new Error("Falta el acceso de Laura.");
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error("No se pudo abrir el refugio.");
  return { db, userId: data.user.id };
});
export async function loadPractice() {
  const { db, userId } = await studentClient();
  const [skills, masteries, streak, state, sessions] = await Promise.all([
    db
      .from("skills")
      .select("*,skill_levels(description)")
      .eq("active", true)
      .order("priority", { ascending: false }),
    db.from("skill_mastery").select("*").eq("user_id", userId),
    db.from("streaks").select("*").eq("user_id", userId).maybeSingle(),
    db
      .from("shelter_state")
      .select("food,blankets,lamps,clean_zones,affection")
      .eq("user_id", userId)
      .maybeSingle(),
    db
      .from("sessions")
      .select("date")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("date", { ascending: false })
      .limit(60),
  ]);
  if (
    skills.error ||
    masteries.error ||
    streak.error ||
    state.error ||
    sessions.error
  )
    throw new Error("No pudimos cargar el refugio. Vuelve a intentarlo.");
  const prepared = (skills.data ?? [])
    .map(prepareSkill)
    .filter((s) => s.family !== "custom" || s.questions?.length);
  const streakData = (streak.data ?? {
    current: 0,
    best: 0,
    total_days: 0,
    last_session_date: null,
  }) as Streak;
  return {
    skills: prepared,
    masteries: (masteries.data ?? []) as Mastery[],
    queue: selectDaily(
      prepared,
      (masteries.data ?? []) as Mastery[],
      new Date().toISOString(),
      `daily-${dayKey()}-${crypto.randomUUID()}`,
    ),
    streak: { ...streakData, current: visibleStreak(streakData, dayKey()) },
    state: (state.data ?? {
      food: 0,
      blankets: 0,
      lamps: 0,
      clean_zones: 0,
      affection: 0,
    }) as ShelterState,
    userId,
    practiceDates: (sessions.data ?? []).map((s) => String(s.date)),
    today: dayKey(),
  };
}
export async function createSession() {
  const { db, userId } = await studentClient();
  const { data, error } = await db
    .from("sessions")
    .insert({ user_id: userId, total_count: 10, date: dayKey() })
    .select("id")
    .single();
  if (error || !data) throw new Error("No pudimos iniciar la misión.");
  return data.id as string;
}
export async function saveAttempt(input: Omit<Attempt, "id" | "created_at">) {
  const { db, userId } = await studentClient();
  const [skillRow, session, history, current] = await Promise.all([
    db
      .from("skills")
      .select("*,skill_levels(description)")
      .eq("id", input.skill_id)
      .single(),
    db
      .from("sessions")
      .select("completed")
      .eq("id", input.session_id)
      .eq("user_id", userId)
      .single(),
    db
      .from("attempts")
      .select("*")
      .eq("user_id", userId)
      .eq("skill_id", input.skill_id)
      .order("created_at"),
    db
      .from("skill_mastery")
      .select("*")
      .eq("user_id", userId)
      .eq("skill_id", input.skill_id)
      .maybeSingle(),
  ]);
  if (
    skillRow.error ||
    session.error ||
    history.error ||
    current.error ||
    session.data?.completed
  )
    throw new Error("Esta misión ya terminó o no está disponible.");
  const skill = prepareSkill(skillRow.data);
  const exercise = exerciseFor(skill, {
    skillId: skill.id,
    family: skill.family,
    level: input.level,
    seed: input.exercise_seed,
  });
  const result = evaluate(exercise, input.given_answer);
  if (!result.valid) throw new Error(result.message);
  const row = {
    ...input,
    user_id: userId,
    prompt_text: exercise.prompt,
    expected_answer: exercise.answer,
    correct: result.correct,
    error_type: result.errorType,
    hint_level: Math.max(0, Math.min(3, input.hint_level)),
    response_ms: Math.max(0, Math.min(3600000, input.response_ms)),
  };
  const { data: attempt, error } = await db
    .from("attempts")
    .insert(row)
    .select("*")
    .single();
  if (error || !attempt) throw new Error("No pudimos guardar este intento.");
  const next = updateMastery(
    current.data ?? {
      skill_id: skill.id,
      mastery_score: 0,
      current_level: input.level,
      recent_accuracy: 0,
      attempts_total: 0,
      last_practiced_at: null,
    },
    attempt as Attempt,
    (history.data ?? []) as Attempt[],
  );
  const { error: masteryError } = await db
    .from("skill_mastery")
    .upsert({ user_id: userId, ...next });
  if (masteryError) throw new Error("No pudimos guardar tu avance.");
  const { data: state, error: stateError } = await db
    .from("shelter_state")
    .select("food,blankets,lamps,clean_zones,affection")
    .eq("user_id", userId)
    .single();
  if (stateError) throw new Error("No pudimos abrir el refugio.");
  if (result.correct) {
    const reward = {
      ...state,
      food: state.food + 1,
      blankets: Math.floor((state.food + 1) / 3),
      lamps: Math.floor((state.food + 1) / 5),
      affection: state.affection + 1,
    };
    const saved = await db
      .from("shelter_state")
      .update(reward)
      .eq("user_id", userId);
    if (saved.error) throw new Error("No pudimos guardar la recompensa.");
    return { state: reward as ShelterState };
  }
  return { state: state as ShelterState };
}
export async function finishSession(
  sessionId: string,
  _correctCount: number,
  durationMs: number,
) {
  const { db, userId } = await studentClient();
  const { data: session, error: sessionError } = await db
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();
  if (sessionError) throw new Error("No se encontró la misión.");
  const [attempts, unlocks, cats, streak] = await Promise.all([
    db
      .from("attempts")
      .select("correct,exercise_seed")
      .eq("session_id", sessionId)
      .eq("user_id", userId),
    db.from("cat_unlocks").select("cat_id").eq("user_id", userId),
    db.from("cats").select("*").order("name"),
    db.from("streaks").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  if (attempts.error || unlocks.error || cats.error || streak.error)
    throw new Error("No pudimos cerrar la misión.");
  if (new Set(attempts.data.map((a) => a.exercise_seed)).size < 10)
    throw new Error("Completa los diez pasos de la misión.");
  const rescued = cats.data.find(
    (c) => !unlocks.data.some((u) => u.cat_id === c.id),
  );
  const rescuedId = session.completed ? session.cat_id : (rescued?.id ?? null);
  const next = completeStreak(
    streak.data ?? {
      current: 0,
      best: 0,
      total_days: 0,
      last_session_date: null,
    },
    dayKey(),
  );
  if (!session.completed) {
    const saved = await db
      .from("sessions")
      .update({
        completed: true,
        correct_count: new Set(
          attempts.data.filter((a) => a.correct).map((a) => a.exercise_seed),
        ).size,
        total_count: 10,
        duration_ms: Math.max(0, durationMs),
        cat_id: rescuedId,
      })
      .eq("id", sessionId)
      .eq("user_id", userId);
    if (saved.error) throw new Error("No pudimos terminar la misión.");
  }
  if (rescuedId) {
    const saved = await db
      .from("cat_unlocks")
      .upsert(
        { user_id: userId, cat_id: rescuedId },
        { onConflict: "user_id,cat_id", ignoreDuplicates: true },
      );
    if (saved.error) throw new Error("No pudimos guardar el rescate.");
  }
  const saved = await db.from("streaks").upsert({ user_id: userId, ...next });
  if (saved.error) throw new Error("No pudimos guardar la racha.");
  const cat = cats.data.find((c) => c.id === rescuedId);
  return {
    streak: next,
    cat: cat
      ? ({ ...cat, unlockedAt: new Date().toISOString() } as ShelterCat)
      : null,
  };
}
export async function getTutorSummary() {
  const db = await database();
  const [skills, attempts, sessions, mastery, notes, streaks, profiles] =
    await Promise.all([
      db
        .from("skills")
        .select("*,skill_levels(description)")
        .order("created_at"),
      db
        .from("attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
      db.from("sessions").select("*").order("date", { ascending: false }),
      db.from("skill_mastery").select("*"),
      db
        .from("tutor_notes")
        .select("*")
        .order("created_at", { ascending: false }),
      db.from("streaks").select("*"),
      db.from("profiles").select("id").eq("role", "student").single(),
    ]);
  if (
    skills.error ||
    attempts.error ||
    sessions.error ||
    mastery.error ||
    notes.error ||
    streaks.error ||
    profiles.error
  )
    throw new Error("No pudimos cargar el panel.");
  return {
    skills: skills.data.map(prepareSkill),
    attempts: attempts.data as Attempt[],
    sessions: sessions.data,
    mastery: mastery.data as Mastery[],
    notes: notes.data,
    streaks: streaks.data,
    userId: profiles.data.id,
  };
}
