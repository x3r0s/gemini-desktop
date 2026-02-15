import { useEffect, useState } from 'react'
import TitleBar from './components/TitleBar'
import Settings from './components/Settings'

const isMac = navigator.userAgent.includes('Macintosh')

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [backdrop, setBackdrop] = useState<string | null>(null)

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
      {settingsOpen && <Settings onClose={closeSettings} backdrop={backdrop} />}
    </>
  )
}

export default App
