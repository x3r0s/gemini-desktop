import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  goBack: () => ipcRenderer.send('view:go-back'),
  goForward: () => ipcRenderer.send('view:go-forward'),
  reload: () => ipcRenderer.send('view:reload'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (partial: Record<string, unknown>) =>
    ipcRenderer.invoke('settings:update', partial),
  onSettingsOpen: (callback: () => void) => {
    ipcRenderer.on('settings:open', callback)
    return () => ipcRenderer.removeListener('settings:open', callback)
  },
  setSettingsPanel: (visible: boolean) => ipcRenderer.invoke('settings:panel', visible) as Promise<string | null>,
  onUpdateStatus: (callback: (_event: unknown, data: { status: string; progress?: number; version?: string; error?: string }) => void) => {
    ipcRenderer.on('update:status', callback as any)
    return () => ipcRenderer.removeListener('update:status', callback as any)
  },
  installUpdate: () => ipcRenderer.send('update:install')
})
