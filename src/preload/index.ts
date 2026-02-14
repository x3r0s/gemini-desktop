import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  goBack: () => ipcRenderer.send('view:go-back'),
  goForward: () => ipcRenderer.send('view:go-forward'),
  reload: () => ipcRenderer.send('view:reload')
})
