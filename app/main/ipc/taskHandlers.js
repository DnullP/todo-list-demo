const { ipcMain } = require('electron');
const taskService = require('../services/taskService');

function wrap(handler) {
  return async (event, ...args) => {
    try {
      const data = await handler(event, ...args);
      return { ok: true, data };
    } catch (e) {
      console.error('ipc handler error', e);
      return { ok: false, error: { code: e.code || 'InternalError', message: e.message || String(e) } };
    }
  };
}

ipcMain.handle('task:create', wrap((_e, payload) => taskService.createTask(payload)));
ipcMain.handle('task:update', wrap((_e, payload) => taskService.updateTask(payload)));
ipcMain.handle('task:complete', wrap((_e, id) => taskService.completeTask(id)));
ipcMain.handle('task:list', wrap((_e, filter) => taskService.listTasks(filter)));
ipcMain.handle('task:stats', wrap(() => taskService.stats()));
ipcMain.handle('task:softDelete', wrap((_e, id) => taskService.softDelete(id)));
ipcMain.handle('task:hardDelete', wrap((_e, id) => taskService.hardDelete(id)));

module.exports = {};
