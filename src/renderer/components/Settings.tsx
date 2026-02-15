import { useEffect, useState } from 'react'

interface AppSettings {
  closeToTray: boolean
  launchAtStartup: boolean
  alwaysOnTop: boolean
}

interface SettingsProps {
  onClose: () => void
  backdrop: string | null
  titleBarHeight?: number
}

type UpdateState =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'available'; version: string }
  | { phase: 'downloading'; progress: number; version: string }
  | { phase: 'ready'; version: string }
  | { phase: 'up-to-date' }
  | { phase: 'error'; message: string }

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
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-500'
        }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''
          }`}
      />
    </button>
  )
}

const isMac = navigator.userAgent.includes('Macintosh')

function Settings({ onClose, backdrop, titleBarHeight = 0 }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [appVersion, setAppVersion] = useState<string>('')
  const [updateState, setUpdateState] = useState<UpdateState>({ phase: 'idle' })

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings)
    window.electronAPI.getAppVersion().then(setAppVersion)
  }, [])

  // Listen for update events while settings is open
  useEffect(() => {
    const cleanup = window.electronAPI.onUpdateStatus((_event, data) => {
      switch (data.status) {
        case 'available':
          setUpdateState({ phase: 'available', version: data.version! })
          break
        case 'downloading':
          setUpdateState((prev) => ({
            phase: 'downloading',
            progress: data.progress ?? 0,
            version: 'version' in prev ? (prev as any).version : data.version ?? ''
          }))
          break
        case 'ready':
          setUpdateState({ phase: 'ready', version: data.version! })
          break
        case 'up-to-date':
          setUpdateState({ phase: 'up-to-date' })
          break
        case 'error':
          setUpdateState({ phase: 'error', message: data.error ?? '알 수 없는 오류' })
          break
      }
    })
    return cleanup
  }, [])

  const handleCheckUpdate = async () => {
    setUpdateState({ phase: 'checking' })
    try {
      await window.electronAPI.checkForUpdate()
      // result comes via update:status event
    } catch {
      setUpdateState({ phase: 'error', message: '업데이트 확인 실패' })
    }
  }

  const update = async (partial: Partial<AppSettings>) => {
    const updated = await window.electronAPI.updateSettings(partial)
    setSettings(updated)
  }

  if (!settings) return null

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 flex items-center justify-center"
      style={{ top: titleBarHeight }}>
      {/* Blurred screenshot of Gemini as backdrop */}
      {backdrop && (
        <img
          src={backdrop}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(12px) brightness(0.5)' }}
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

        {/* Update section */}
        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium">업데이트</div>
              <div className="text-xs text-gray-400 mt-0.5">
                현재 버전: v{appVersion || '...'}
              </div>
            </div>
            {(updateState.phase === 'idle' || updateState.phase === 'up-to-date' || updateState.phase === 'error') && (
              <button
                onClick={handleCheckUpdate}
                className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
              >
                업데이트 확인
              </button>
            )}
          </div>

          {/* Update status */}
          {updateState.phase === 'checking' && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              업데이트 확인 중...
            </div>
          )}

          {updateState.phase === 'up-to-date' && (
            <div className="text-xs text-green-400 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              최신 버전입니다
            </div>
          )}

          {updateState.phase === 'available' && (
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div>
                <p className="text-sm text-blue-300 font-medium">v{updateState.version}</p>
                <p className="text-xs text-gray-400">새 버전이 있습니다</p>
              </div>
              <button
                onClick={() => window.electronAPI.downloadUpdate()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
              >
                다운로드
              </button>
            </div>
          )}

          {updateState.phase === 'downloading' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">v{updateState.version} 다운로드 중</span>
                <span className="text-xs text-gray-400 font-mono">{updateState.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${updateState.progress}%` }}
                />
              </div>
            </div>
          )}

          {updateState.phase === 'ready' && (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm text-green-300">v{updateState.version} 준비 완료</p>
              <button
                onClick={() => window.electronAPI.installUpdate()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors"
              >
                재시작
              </button>
            </div>
          )}

          {updateState.phase === 'error' && (
            <p className="text-xs text-red-400">{updateState.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings

