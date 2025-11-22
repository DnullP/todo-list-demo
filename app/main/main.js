const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    if (isDev) {
        win.loadURL('http://localhost:5173');
        // 可选：打开 devtools
        win.webContents.openDevTools();
    } else {
        const indexPath = path.join(__dirname, '..', 'renderer', 'dist', 'index.html');
        win.loadFile(indexPath);
    }
}

app.whenReady().then(createWindow);

// Load IPC handlers and services
try {
    require(path.join(__dirname, 'ipc', 'taskHandlers.js'));
    const scheduler = require(path.join(__dirname, 'services', 'schedulerService.js'));
    scheduler.start();
} catch (e) {
    console.warn('Failed to load services/ipc:', e);
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});