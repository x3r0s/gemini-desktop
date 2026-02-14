import { useEffect, useState } from 'react'
import TitleBar from './components/TitleBar'
import Settings from './components/Settings'

const isMac = navigator.userAgent.includes('Macintosh')

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Listen for macOS menu "Settings..." (Cmd+,)
  useEffect(() => {
    const cleanup = window.electronAPI.onSettingsOpen(() => {
      setSettingsOpen(true)
    })
    return cleanup
  }, [])

  return (
    <>
      {!isMac && (
        <div className="h-8">
          <TitleBar onSettingsOpen={() => setSettingsOpen(true)} />
        </div>
      )}
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </>
  )
}

export default App
