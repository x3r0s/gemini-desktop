import { useEffect, useState } from 'react'

interface AppSettings {
  closeToTray: boolean
  launchAtStartup: boolean
  alwaysOnTop: boolean
}

interface SettingsProps {
  onClose: () => void
  backdrop: string | null
}

function Toggle({
  checked,
  onChange
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        checked ? 'bg-blue-500' : 'bg-gray-500'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

const isMac = navigator.userAgent.includes('Macintosh')

function Settings({ onClose, backdrop }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings)
  }, [])

  const update = async (partial: Partial<AppSettings>) => {
    const updated = await window.electronAPI.updateSettings(partial)
    setSettings(updated)
  }

  if (!settings) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred screenshot of Gemini as backdrop */}
      {backdrop && (
        <img
          src={backdrop}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(12px) brightness(0.5)', transform: 'scale(1.05)' }}
          alt=""
        />
      )}
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[#1e1e2e] text-gray-200 rounded-lg shadow-2xl w-[400px] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        {/* Settings list */}
        <div className="px-5 py-4 space-y-5">
          {!isMac && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Close to tray</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Minimize to system tray instead of quitting
                </div>
              </div>
              <Toggle
                checked={settings.closeToTray}
                onChange={(v) => update({ closeToTray: v })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Launch at startup</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Automatically start when you log in
              </div>
            </div>
            <Toggle
              checked={settings.launchAtStartup}
              onChange={(v) => update({ launchAtStartup: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Always on top</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Keep window above other applications
              </div>
            </div>
            <Toggle
              checked={settings.alwaysOnTop}
              onChange={(v) => update({ alwaysOnTop: v })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
