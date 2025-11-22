const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function getDbPath() {
  const dataDir = app.getPath('userData');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, 'todolist.json');
}

function readDb() {
  const p = getDbPath();
  try {
    if (!fs.existsSync(p)) return { tasks: [] };
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw || '{"tasks":[]}');
  } catch (e) {
    console.error('readDb error', e);
    return { tasks: [] };
  }
}

function writeDb(data) {
  const p = getDbPath();
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('writeDb error', e);
    throw e;
  }
}

class TaskRepository {
  constructor() {
    this.reload();
  }

  reload() {
    const db = readDb();
    this.tasks = db.tasks || [];
  }

  persist() {
    writeDb({ tasks: this.tasks });
  }

  create(task) {
    this.tasks.push(task);
    this.persist();
    return task;
  }

  update(task) {
    const idx = this.tasks.findIndex((t) => t.id === task.id);
    if (idx === -1) throw new Error('NotFound');
    this.tasks[idx] = task;
    this.persist();
    return task;
  }

  getById(id) {
    return this.tasks.find((t) => t.id === id) || null;
  }

  list(filter = {}) {
    let res = this.tasks.slice();
    if (filter.status) res = res.filter((t) => t.status === filter.status);
    if (filter.projectId) res = res.filter((t) => t.projectId === filter.projectId);
    if (filter.dueBefore) res = res.filter((t) => t.dueAt && new Date(t.dueAt) <= new Date(filter.dueBefore));
    if (filter.dueAfter) res = res.filter((t) => t.dueAt && new Date(t.dueAt) >= new Date(filter.dueAfter));
    if (filter.includeArchived === false) res = res.filter((t) => t.status !== 'archived');
    return res;
  }

  softDelete(id) {
    const t = this.getById(id);
    if (!t) throw new Error('NotFound');
    t.status = 'archived';
    t.updatedAt = new Date().toISOString();
    this.persist();
    return t;
  }

  hardDelete(id) {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('NotFound');
    const removed = this.tasks.splice(idx, 1)[0];
    this.persist();
    return removed;
  }

  stats() {
    const total = this.tasks.filter((t) => t.status !== 'archived').length;
    const completed = this.tasks.filter((t) => t.status === 'completed').length;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    const overdue = this.tasks.filter((t) => t.status === 'active' && t.dueAt && new Date(t.dueAt) < now).length;
    const todayCount = this.tasks.filter((t) => t.status === 'active' && t.dueAt && new Date(t.dueAt) >= todayStart && new Date(t.dueAt) <= todayEnd).length;
    return { total, completed, overdue, today: todayCount };
  }
}

module.exports = new TaskRepository();
