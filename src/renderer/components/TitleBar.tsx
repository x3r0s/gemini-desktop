import appIcon from '../../assets/icon.png'

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      close: () => void
      goBack: () => void
      goForward: () => void
      reload: () => void
      getSettings: () => Promise<any>
      updateSettings: (partial: Record<string, unknown>) => Promise<any>
      onSettingsOpen: (callback: () => void) => () => void
      setSettingsPanel: (visible: boolean) => Promise<string | null>
      onUpdateStatus: (callback: (_event: unknown, data: { status: string; progress?: number; version?: string; error?: string }) => void) => () => void
      installUpdate: () => void
    }
  }
}

interface TitleBarProps {
  onSettingsOpen: () => void
}

function TitleBar({ onSettingsOpen }: TitleBarProps) {
  return (
    <div className="flex items-center justify-between h-8 bg-[#1a1a2e] select-none"
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* Left: logo + title + navigation */}
      <div className="flex items-center h-full">
        <div className="flex items-center pl-3 pr-2"
             style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <img src={appIcon} alt="Gemini Desktop" className="w-4 h-4" draggable={false} />
          <span className="text-white text-sm font-medium pl-2">
            Gemini Desktop
          </span>
        </div>
        <div className="flex items-center h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => window.electronAPI.goBack()}
            className="h-full px-2.5 text-gray-400 hover:bg-white/10 hover:text-gray-200 transition-colors"
            title="Back"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="8,1 3,6 8,11" />
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI.goForward()}
            className="h-full px-2.5 text-gray-400 hover:bg-white/10 hover:text-gray-200 transition-colors"
            title="Forward"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4,1 9,6 4,11" />
            </svg>
          </button>
          <button
            onClick={() => window.electronAPI.reload()}
            className="h-full px-2.5 text-gray-400 hover:bg-white/10 hover:text-gray-200 transition-colors"
            title="Reload"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1,6 A5,5 0 1,1 3,10" />
              <polyline points="1,10 3,10 3,8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: settings + window controls */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={onSettingsOpen}
          className="h-full px-3 text-gray-400 hover:bg-white/10 hover:text-gray-200 transition-colors"
          title="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button
          onClick={() => window.electronAPI.minimize()}
          className="h-full px-4 text-gray-300 hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          onClick={() => window.electronAPI.maximize()}
          className="h-full px-4 text-gray-300 hover:bg-white/10 transition-colors"
          title="Maximize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" />
          </svg>
        </button>
        <button
          onClick={() => window.electronAPI.close()}
          className="h-full px-4 text-gray-300 hover:bg-red-500 hover:text-white transition-colors"
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2">
            <line x1="0" y1="0" x2="10" y2="10" />
            <line x1="10" y1="0" x2="0" y2="10" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
