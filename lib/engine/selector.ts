import type { Mastery, Question, Skill } from "./types";
import { random } from "./random";
export function dailySkill(
  skills: Skill[],
  date: string,
  lockedId?: string,
): Skill | undefined {
  const active = skills
    .filter((s) => s.active)
    .sort((a, b) => a.id.localeCompare(b.id));
  const locked = active.find((s) => s.id === lockedId);
  if (locked) return locked;
  const weekday = new Date(`${date.slice(0, 10)}T12:00:00Z`).getUTCDay();
  const scheduled = active.filter(
    (s) => !s.practiceDays?.length || s.practiceDays.includes(weekday),
  );
  const eligible = scheduled;
  if (!eligible.length) return undefined;
  const total = eligible.reduce((n, s) => n + Math.max(1, s.priority), 0);
  let ticket = random(`topic:${date.slice(0, 10)}`)() * total;
  return (
    eligible.find((s) => (ticket -= Math.max(1, s.priority)) < 0) ?? eligible[0]
  );
}
export function selectDaily(
  skills: Skill[],
  _masteries: Mastery[],
  now: string,
  sessionSeed: string,
  lockedId?: string,
): Question[] {
  const skill = dailySkill(skills, now, lockedId);
  if (!skill) return [];
  const available=skill.family==="custom" ? [...new Set(skill.questions?.map(q=>q.level)??[])].sort() : [];
  return Array.from({ length: 10 }, (_, i) => ({
    skillId: skill.id,
    family: skill.family,
    level: (available.length ? available.filter(l=>l<=([1,1,1,2,2,2,3,3,4,4] as const)[i]).at(-1) ?? available[0] : ([1,1,1,2,2,2,3,3,4,4] as const)[i]),
    seed: `${sessionSeed}:${i}`,
  }));
}
export function reinforce(queue: Question[], index: number): Question[] {
  const current = queue[index];
  if (!current || current.reinforced) return queue;
  const next = [...queue];
  const copy = { ...current, seed: `${current.seed}:repaso`, reinforced: true };
  next.splice(Math.min(index + 3, next.length), 0, copy);
  return next;
}
