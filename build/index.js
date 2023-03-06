"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.app.on('ready', () => {
    console.log('App is ready');
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        useContentSize: true,
        resizable: false,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile("./pages/index.html");
});
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
