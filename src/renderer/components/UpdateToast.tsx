import { useEffect } from 'react'

export interface UpdateStatus {
  status: 'available' | 'downloading' | 'ready' | 'up-to-date' | 'error'
  progress?: number
  version?: string
  error?: string
}

interface UpdateToastProps {
  update: UpdateStatus
  onDismiss: () => void
}

function UpdateToast({ update, onDismiss }: UpdateToastProps) {
  // Auto-dismiss errors after 8 seconds
  useEffect(() => {
    if (update.status === 'error') {
      const timer = setTimeout(onDismiss, 8000)
      return () => clearTimeout(timer)
    }
  }, [update.status, onDismiss])

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-[#1e1e3a] border border-white/10 rounded-lg shadow-2xl p-4 text-white text-sm animate-slide-up">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5">
          <line x1="0" y1="0" x2="10" y2="10" />
          <line x1="10" y1="0" x2="0" y2="10" />
        </svg>
      </button>

      {update.status === 'downloading' && (
        <div>
          <p className="font-medium mb-2">
            {update.version ? `v${update.version} 다운로드 중...` : '업데이트 다운로드 중...'}
          </p>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${update.progress ?? 0}%` }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-1">{update.progress ?? 0}%</p>
        </div>
      )}

      {update.status === 'ready' && (
        <div>
          <p className="font-medium mb-2">
            {update.version ? `v${update.version} 업데이트 준비 완료` : '업데이트 준비 완료'}
          </p>
          <p className="text-gray-400 text-xs mb-3">앱을 재시작하면 업데이트가 적용됩니다.</p>
          <button
            onClick={() => window.electronAPI.installUpdate()}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
          >
            지금 재시작
          </button>
        </div>
      )}

      {update.status === 'error' && (
        <div>
          <p className="font-medium text-red-400 mb-1">업데이트 실패</p>
          <p className="text-gray-400 text-xs">{update.error || '알 수 없는 오류가 발생했습니다.'}</p>
        </div>
      )}
    </div>
  )
}

export default UpdateToast
