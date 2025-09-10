import { Task, TaskStatus } from "./types";

type ApiKey = { key: string; usedToday: number; limit: number };

const tasks = new Map<string, Task>();
const tasksByFreepik = new Map<string, string>();
const apiKeys: ApiKey[] = [];

function now() {
  return new Date().toISOString();
}

export function seedApiKey(key: string, limit = 1000) {
  if (!apiKeys.find((k) => k.key === key)) apiKeys.push({ key, usedToday: 0, limit });
}

export function selectApiKey(): string | undefined {
  if (apiKeys.length === 0) return undefined;
  // naive round-robin by sorting on usage
  const sorted = [...apiKeys].sort((a, b) => a.usedToday - b.usedToday);
  const candidate = sorted.find((k) => k.usedToday < k.limit) || sorted[0];
  candidate.usedToday += 1;
  return candidate.key;
}

export function createTask(input: Omit<Task, "createdAt" | "updatedAt">): Task {
  const item: Task = { ...input, createdAt: now(), updatedAt: now() };
  tasks.set(item.id, item);
  if (item.freepikTaskId) tasksByFreepik.set(item.freepikTaskId, item.id);
  return item;
}

export function updateTask(id: string, patch: Partial<Task>) {
  const prev = tasks.get(id);
  if (!prev) return undefined;
  const next: Task = { ...prev, ...patch, updatedAt: now() };
  tasks.set(id, next);
  if (next.freepikTaskId) tasksByFreepik.set(next.freepikTaskId, id);
  return next;
}

export function getTask(id: string) {
  return tasks.get(id);
}

export function getTaskByFreepikTaskId(fpTaskId: string) {
  const id = tasksByFreepik.get(fpTaskId);
  return id ? tasks.get(id) : undefined;
}

export function setTaskStatus(id: string, status: TaskStatus) {
  return updateTask(id, { status });
}

export function listTasks() {
  return Array.from(tasks.values());
}

