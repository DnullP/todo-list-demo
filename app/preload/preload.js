const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('todoApi', {
	createTask: (payload) => ipcRenderer.invoke('task:create', payload),
	updateTask: (payload) => ipcRenderer.invoke('task:update', payload),
	completeTask: (id) => ipcRenderer.invoke('task:complete', id),
	listTasks: (filter) => ipcRenderer.invoke('task:list', filter),
	stats: () => ipcRenderer.invoke('task:stats'),
	softDelete: (id) => ipcRenderer.invoke('task:softDelete', id),
	hardDelete: (id) => ipcRenderer.invoke('task:hardDelete', id),
	onTaskDue: (cb) => {
		const listener = (_e, taskId) => cb(taskId);
		ipcRenderer.on('task:due', listener);
		return () => ipcRenderer.removeListener('task:due', listener);
	},
});
