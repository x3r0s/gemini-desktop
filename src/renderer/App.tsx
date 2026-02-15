import { useCallback, useEffect, useState } from 'react'
import TitleBar from './components/TitleBar'
import Settings from './components/Settings'
import UpdateToast, { type UpdateStatus } from './components/UpdateToast'

const isMac = navigator.userAgent.includes('Macintosh')

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [backdrop, setBackdrop] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)

  const dismissUpdate = useCallback(() => setUpdateStatus(null), [])

  // Listen for update status from main process
  useEffect(() => {
    const cleanup = window.electronAPI.onUpdateStatus((_event, data) => {
      setUpdateStatus(data as UpdateStatus)
    })
    return cleanup
  }, [])

  const openSettings = async () => {
    const dataUrl = await window.electronAPI.setSettingsPanel(true)
    setBackdrop(dataUrl)
    setSettingsOpen(true)
  }

  const closeSettings = async () => {
    await window.electronAPI.setSettingsPanel(false)
    setSettingsOpen(false)
    setBackdrop(null)
  }

  // Listen for macOS menu "Settings..." (Cmd+,)
  useEffect(() => {
    const cleanup = window.electronAPI.onSettingsOpen(() => {
      openSettings()
    })
    return cleanup
  }, [])

  return (
    <>
      {!isMac && (
        <div className="h-8">
          <TitleBar onSettingsOpen={openSettings} />
        </div>
      )}
      {settingsOpen && <Settings onClose={closeSettings} backdrop={backdrop} titleBarHeight={isMac ? 0 : 32} />}
      {updateStatus && <UpdateToast update={updateStatus} onDismiss={dismissUpdate} />}
    </>
  )
}

export default App
