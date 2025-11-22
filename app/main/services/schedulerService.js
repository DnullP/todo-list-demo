const taskRepository = require('./taskRepository');
const { BrowserWindow, Notification } = require('electron');

class SchedulerService {
  constructor() {
    this.timer = null;
    this.notified = new Set();
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 60 * 1000);
    // also run immediately
    this.tick();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async tick() {
    const now = new Date();
    const upcoming = taskRepository.list({ status: 'active' });
    for (const task of upcoming) {
      if (!task.dueAt) continue;
      const due = new Date(task.dueAt);
      // notify when due time has passed and not yet notified
      if (due <= now && !this.notified.has(task.id)) {
        try {
          new Notification({ title: 'Todo 到期', body: task.title || '任务到期' }).show();
        } catch (e) {
          console.warn('Notification failed', e);
        }
        this.notified.add(task.id);
        BrowserWindow.getAllWindows().forEach((win) => win.webContents.send('task:due', task.id));
      }
    }
  }
}

module.exports = new SchedulerService();
