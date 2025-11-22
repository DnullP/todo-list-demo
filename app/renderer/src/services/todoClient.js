export const todoClient = {
  createTask: (payload) => window.todoApi.createTask(payload),
  updateTask: (payload) => window.todoApi.updateTask(payload),
  completeTask: (id) => window.todoApi.completeTask(id),
  listTasks: (filter) => window.todoApi.listTasks(filter),
  stats: () => window.todoApi.stats(),
  softDelete: (id) => window.todoApi.softDelete(id),
  hardDelete: (id) => window.todoApi.hardDelete(id),
  onTaskDue: (cb) => window.todoApi.onTaskDue(cb),
};
