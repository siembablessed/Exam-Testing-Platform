interface ElectronAPI {
  resetExam: () => void;
  getAppMode: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};