import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supportedLanguages, type SupportedLanguage } from '../i18n'

interface AppSettings {
  closeToTray: boolean
  launchAtStartup: boolean
  alwaysOnTop: boolean
  language?: string
}

interface SettingsProps {
  onClose: () => void
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

// --- Icons ---
const Icons = {
  General: (props: any) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Info: (props: any) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Close: (props: any) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Download: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Refresh: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

// --- Components ---

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
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e1e2e] focus:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-white/10'
        }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${checked ? 'translate-x-6' : 'translate-x-0'
          }`}
      />
    </button>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick
}: {
  icon: any
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
      {label}
    </button>
  )
}

const isMac = navigator.userAgent.includes('Macintosh')

function Settings({ onClose, titleBarHeight = 0 }: SettingsProps) {
  const { t, i18n } = useTranslation()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [appVersion, setAppVersion] = useState<string>('')
  const [updateState, setUpdateState] = useState<UpdateState>({ phase: 'idle' })
  const [activeTab, setActiveTab] = useState<'general' | 'about'>('general')

  useEffect(() => {
    window.electronAPI.getSettings().then((s) => {
      setSettings(s)
      if (s.language && s.language !== i18n.language) {
        i18n.changeLanguage(s.language)
      }
    })
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
          setUpdateState({ phase: 'error', message: data.error ?? t('updateToast.error', { error: 'Unknown' }) })
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
      setUpdateState({ phase: 'error', message: t('updateToast.error', { error: 'Failed' }) })
    }
  }

  const update = async (partial: Partial<AppSettings>) => {
    const updated = await window.electronAPI.updateSettings(partial)
    setSettings(updated)
  }

  if (!settings) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-gray-200 font-sans select-none animate-in fade-in duration-200">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex overflow-hidden bg-[#1e1e2e] rounded-2xl shadow-2xl ring-1 ring-white/10 m-4 sm:m-8 lg:m-12">
        {/* Sidebar */}
        <div className="w-64 flex flex-col bg-[#181825] border-r border-white/5 p-4">
          <div className="mb-8 px-2 flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">Settings</span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem
              icon={Icons.General}
              label={t('settings.title')} // "General" or "Settings" depending on translation, usually 'General' consists of basic settings
              isActive={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
            />
            <SidebarItem
              icon={Icons.Info}
              label={t('settings.update')} // "About" or "Update"
              isActive={activeTab === 'about'}
              onClick={() => setActiveTab('about')}
            />
          </nav>

          <div className="mt-auto px-2 pb-2">
            <div className="text-xs text-gray-600 font-mono">v{appVersion}</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e2e] overflow-hidden">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-8 border-b border-white/5">
            <h2 className="text-xl font-semibold text-white">
              {activeTab === 'general' ? t('settings.title') : t('settings.update')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Icons.Close />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-2 duration-300">

              {activeTab === 'general' && (
                <>
                  {/* System Settings Group */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('settings.system')}</h3>

                    {!isMac && (
                      <div className="flex items-center justify-between group p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors border border-white/5">
                        <div>
                          <div className="text-base font-medium text-gray-200">{t('settings.closeToTray')}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {settings.closeToTray ? t('settings.on') : t('settings.off')}
                          </div>
                        </div>
                        <Toggle
                          checked={settings.closeToTray}
                          onChange={(v) => update({ closeToTray: v })}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between group p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors border border-white/5">
                      <div>
                        <div className="text-base font-medium text-gray-200">{t('settings.launchAtStartup')}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {settings.launchAtStartup ? t('settings.on') : t('settings.off')}
                        </div>
                      </div>
                      <Toggle
                        checked={settings.launchAtStartup}
                        onChange={(v) => update({ launchAtStartup: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between group p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors border border-white/5">
                      <div>
                        <div className="text-base font-medium text-gray-200">{t('settings.alwaysOnTop')}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {settings.alwaysOnTop ? t('settings.on') : t('settings.off')}
                        </div>
                      </div>
                      <Toggle
                        checked={settings.alwaysOnTop}
                        onChange={(v) => update({ alwaysOnTop: v })}
                      />
                    </div>
                  </div>

                  {/* Language Settings Group */}
                  <div className="space-y-6 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('settings.localization')}</h3>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <div className="text-base font-medium text-gray-200">{t('settings.language')}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {t(`languages.${settings.language || 'en'}`)}
                        </div>
                      </div>
                      <select
                        value={settings.language || 'en'}
                        onChange={(e) => {
                          const lang = e.target.value as SupportedLanguage
                          i18n.changeLanguage(lang)
                          update({ language: lang })
                        }}
                        className="px-4 py-2 text-sm bg-[#181825] hover:bg-black/40 border border-white/10 rounded-lg text-gray-300 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {supportedLanguages.map((lang) => (
                          <option key={lang} value={lang} className="bg-[#1e1e2e]">
                            {t(`languages.${lang}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('settings.information')}</h3>

                  <div className="p-6 rounded-xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-white mb-1">Gemini Desktop</h4>
                        <p className="text-sm text-gray-400">Current version: v{appVersion || '...'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {(updateState.phase === 'idle' || updateState.phase === 'up-to-date' || updateState.phase === 'error') && (
                          <button
                            onClick={handleCheckUpdate}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                          >
                            <Icons.Refresh />
                            {t('settings.checkUpdate')}
                          </button>
                        )}

                        {/* Status Messages */}
                        {updateState.phase === 'checking' && (
                          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            {t('settings.checking')}
                          </div>
                        )}

                        {updateState.phase === 'up-to-date' && (
                          <div className="flex items-center gap-2 text-sm text-green-400 py-2">
                            <Icons.Check />
                            {t('settings.upToDate')}
                          </div>
                        )}

                        {updateState.phase === 'error' && (
                          <div className="text-sm text-red-400 py-2">
                            {updateState.message}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Update Available Card */}
                    {updateState.phase === 'available' && (
                      <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-blue-400">Update Available</div>
                          <div className="text-xs text-gray-400 mt-1">Version {updateState.version} is ready to download.</div>
                        </div>
                        <button
                          onClick={() => window.electronAPI.downloadUpdate()}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                        >
                          <Icons.Download />
                          {t('settings.download')}
                        </button>
                      </div>
                    )}

                    {/* Downloading Progress */}
                    {updateState.phase === 'downloading' && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{t('settings.downloading', { percent: updateState.progress })}</span>
                          <span className="font-mono">{updateState.progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${updateState.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Ready to Install */}
                    {updateState.phase === 'ready' && (
                      <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-400">Update Ready</div>
                          <div className="text-xs text-gray-400 mt-1">Version {updateState.version} has been downloaded.</div>
                        </div>
                        <button
                          onClick={() => window.electronAPI.installUpdate()}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors shadow-lg shadow-green-500/20"
                        >
                          <Icons.Refresh />
                          {t('settings.restart')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

