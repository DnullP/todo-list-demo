const taskRepository = require('./taskRepository');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_PRIORITY = 'medium';

const taskService = {
  async createTask(input) {
    const now = new Date().toISOString();
    const task = {
      id: uuidv4(),
      title: input.title || 'Untitled',
      description: input.description || '',
      projectId: input.projectId ?? null,
      createdAt: now,
      updatedAt: now,
      dueAt: input.dueAt ?? null,
      completedAt: null,
      priority: input.priority || DEFAULT_PRIORITY,
      status: 'active',
      tags: input.tags || [],
    };
    return taskRepository.create(task);
  },

  async updateTask(patch) {
    const t = taskRepository.getById(patch.id);
    if (!t) throw new Error('TaskNotFound');
    const updated = Object.assign({}, t, patch, { updatedAt: new Date().toISOString() });
    return taskRepository.update(updated);
  },

  async completeTask(id) {
    const t = taskRepository.getById(id);
    if (!t) throw new Error('TaskNotFound');
    if (t.status === 'archived') throw new Error('TaskArchived');
    t.status = 'completed';
    t.completedAt = new Date().toISOString();
    t.updatedAt = new Date().toISOString();
    return taskRepository.update(t);
  },

  async listTasks(filter) {
    return taskRepository.list(Object.assign({ includeArchived: false }, filter || {}));
  },

  async stats() {
    return taskRepository.stats();
  },

  async softDelete(id) {
    return taskRepository.softDelete(id);
  },

  async hardDelete(id) {
    return taskRepository.hardDelete(id);
  },
};

module.exports = taskService;
