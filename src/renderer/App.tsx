import { useCallback, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import TitleBar from './components/TitleBar'
import Settings from './components/Settings'
import UpdateToast, { type UpdateStatus } from './components/UpdateToast'
import UpdateModal, { type UpdateInfo } from './components/UpdateModal'

const isMac = navigator.userAgent.includes('Macintosh')

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [updateModal, setUpdateModal] = useState<UpdateInfo | null>(null)

  const dismissUpdate = useCallback(() => setUpdateStatus(null), [])
  const dismissModal = useCallback(() => setUpdateModal(null), [])

  // Load saved language setting
  useEffect(() => {
    window.electronAPI.getSettings().then((settings) => {
      if (settings.language && settings.language !== i18n.language) {
        i18n.changeLanguage(settings.language)
      }
    })
  }, [])

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
    await window.electronAPI.setSettingsPanel(true)
    setSettingsOpen(true)
  }

  const closeSettings = async () => {
    await window.electronAPI.setSettingsPanel(false)
    setSettingsOpen(false)
  }

  // Listen for macOS menu "Settings..." (Cmd+,)
  useEffect(() => {
    const cleanup = window.electronAPI.onSettingsOpen(() => {
      openSettings()
    })
    return cleanup
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      {!isMac && (
        <div className="h-8">
          <TitleBar onSettingsOpen={openSettings} />
        </div>
      )}
      {settingsOpen && <Settings onClose={closeSettings} titleBarHeight={isMac ? 0 : 32} />}
      {updateModal && !settingsOpen && <UpdateModal update={updateModal} onDismiss={dismissModal} />}
      {updateStatus && !updateModal && !settingsOpen && <UpdateToast update={updateStatus} onDismiss={dismissUpdate} />}
    </I18nextProvider>
  )
}

export default App
