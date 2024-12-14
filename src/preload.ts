import { Song } from "./server/types";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getSongs: () => ipcRenderer.invoke("getSongs") as Promise<Song[]>,
  modifySong: (song: string) => ipcRenderer.invoke("modifySong", song) as Promise<boolean>,
  loadMusic: (id: number) => ipcRenderer.invoke("loadMusic", id) as Promise<string>,
});
