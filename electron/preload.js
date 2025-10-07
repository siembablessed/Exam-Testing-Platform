const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  resetExam: () => ipcRenderer.send('reset-exam'),
  getAppMode: () => ipcRenderer.invoke('get-app-mode'),
})
