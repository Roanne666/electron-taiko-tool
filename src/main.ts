import { Song } from "./server/types";
import { loadSongs, modifySong } from "./server/song";
import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "node:path";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "../../public/favicon-32x32.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.maximize()
  
  Menu.setApplicationMenu(null);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  const mainWindow = createWindow();
  const SONG_PATH = "NODE_ENV" in process.env ? "./Songs" : "../Songs";

  if ("NODE_ENV" in process.env) mainWindow.webContents.openDevTools();

  ipcMain.handle("getSongs", async () => {
    const songs = await loadSongs(SONG_PATH);
    return songs;
  });
  ipcMain.handle("modifySong", (e: Electron.IpcMainInvokeEvent, song: string) => {
    const songObject = JSON.parse(song) as Song;
    modifySong(songObject);
    return true;
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
