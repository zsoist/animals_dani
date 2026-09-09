'use server';

import { revalidatePath } from 'next/cache';
import { database } from './server';

async function tutorDatabase() {
  const db = await database();
  const { data: user } = await db.auth.getUser();
  if (!user.user) throw new Error('Necesitas entrar como Admin.');
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.user.id).single();
  if (profile?.role !== 'tutor') throw new Error('Acceso reservado al Admin.');
  return db;
}

export async function createSkill(form: FormData) {
  const name = String(form.get('name') ?? '').trim();
  const subject = String(form.get('subject') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  if (!name || !description || !['matematicas', 'fisica', 'quimica'].includes(subject)) throw new Error('Completa nombre, materia y descripción.');
  const db = await tutorDatabase();
  const { data: skill, error } = await db.from('skills').insert({ name, subject, description, active: true, priority: 1, base_difficulty: 1 }).select('id').single();
  if (error || !skill) throw new Error('No se pudo crear la habilidad.');
  const levels = ['Introducción', 'Práctica guiada', 'Mezcla de pasos', 'Aplicación'];
  const { error: levelError } = await db.from('skill_levels').insert(levels.map((text, index) => ({ skill_id: skill.id, level: index + 1, description: text })));
  if (levelError) throw new Error('No se pudieron crear los niveles.');
  revalidatePath('/tutor');
  revalidatePath('/');
}

export async function updateSkill(form: FormData) {
  const id = String(form.get('id') ?? '');
  const priority = Math.max(1, Math.min(10, Number(form.get('priority') ?? 1)));
  const active = form.get('active') === 'on';
  if (!id) throw new Error('Falta la habilidad.');
  const db = await tutorDatabase();
  const { error } = await db.from('skills').update({ priority, active }).eq('id', id);
  if (error) throw new Error('No se pudo actualizar la habilidad.');
  revalidatePath('/tutor');
  revalidatePath('/');
}

export async function deleteSkill(form: FormData) {
  const id = String(form.get('id') ?? '');
  if (!id) throw new Error('Falta la habilidad.');
  const db = await tutorDatabase();
  const { error } = await db.from('skills').delete().eq('id', id);
  if (error) throw new Error('No se puede borrar una habilidad que ya tiene intentos. Desactívala.');
  revalidatePath('/tutor');
  revalidatePath('/');
}
