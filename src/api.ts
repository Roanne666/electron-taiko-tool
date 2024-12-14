import { Song } from "./server/types";

export type ElectronAPIs = {
  getSongs: () => Promise<Song[]>;
  modifySong: (song: string) => Promise<boolean>;
  loadMusic: (id: number) => Promise<string>;
};
