import { app, BrowserWindow } from 'electron';

app.on('ready', () => {
    console.log('App is ready');

    const win = new BrowserWindow({
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

app.on('window-all-closed', () => {
    app.quit()
  })