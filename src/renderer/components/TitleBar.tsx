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
      {/* Left: navigation + title */}
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
        <span className="text-white text-sm font-medium pl-2"
              style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          Gemini Desktop
        </span>
      </div>

      {/* Right: settings + window controls */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={onSettingsOpen}
          className="h-full px-3 text-gray-400 hover:bg-white/10 hover:text-gray-200 transition-colors"
          title="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="2.5" />
            <path d="M7 0.5v1.5M7 12v1.5M0.5 7H2M12 7h1.5M2.05 2.05l1.06 1.06M10.89 10.89l1.06 1.06M2.05 11.95l1.06-1.06M10.89 3.11l1.06-1.06" />
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
