import TitleBar from './components/TitleBar'

// On macOS, native traffic lights handle window controls,
// so the custom titlebar is hidden and Gemini fills the full window.
const isMac = navigator.userAgent.includes('Macintosh')

function App() {
  if (isMac) return null

  return (
    <div className="h-8">
      <TitleBar />
    </div>
  )
}

export default App
