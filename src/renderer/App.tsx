import { useCallback, useEffect, useState } from 'react'
import TitleBar from './components/TitleBar'
import Settings from './components/Settings'
import UpdateToast, { type UpdateStatus } from './components/UpdateToast'
import UpdateModal, { type UpdateInfo } from './components/UpdateModal'

const isMac = navigator.userAgent.includes('Macintosh')

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [backdrop, setBackdrop] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [updateModal, setUpdateModal] = useState<UpdateInfo | null>(null)

  const dismissUpdate = useCallback(() => setUpdateStatus(null), [])
  const dismissModal = useCallback(() => setUpdateModal(null), [])

  // Listen for update status from main process
  useEffect(() => {
    const cleanup = window.electronAPI.onUpdateStatus((_event, data) => {
      const status = data as UpdateStatus & { status: string }

      // Show modal for initial 'available' event
      if (status.status === 'available' && status.version) {
        setUpdateModal({
          version: status.version,
          status: 'available',
        })
        return
      }

      // Update modal if it's open
      if (status.status === 'downloading') {
        setUpdateModal((prev) =>
          prev
            ? { ...prev, status: 'downloading', progress: status.progress ?? 0 }
            : null
        )
        // Also show toast if modal was dismissed
        if (!updateModal) {
          setUpdateStatus(status)
        }
        return
      }

      if (status.status === 'ready' && status.version) {
        setUpdateModal((prev) =>
          prev
            ? { ...prev, status: 'ready', version: status.version! }
            : null
        )
        if (!updateModal) {
          setUpdateStatus(status)
        }
        return
      }

      if (status.status === 'error') {
        setUpdateModal((prev) =>
          prev
            ? { ...prev, status: 'error', error: status.error }
            : null
        )
        if (!updateModal) {
          setUpdateStatus(status)
        }
        return
      }

      // up-to-date — no UI needed
    })
    return cleanup
  }, [updateModal])

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
      {updateModal && !settingsOpen && <UpdateModal update={updateModal} onDismiss={dismissModal} />}
      {updateStatus && !updateModal && !settingsOpen && <UpdateToast update={updateStatus} onDismiss={dismissUpdate} />}
    </>
  )
}

export default App
