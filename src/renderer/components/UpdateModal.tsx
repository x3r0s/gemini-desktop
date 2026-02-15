import { useState } from 'react'

export interface UpdateInfo {
    version: string
    status: 'available' | 'downloading' | 'ready' | 'error'
    progress?: number
    error?: string
}

interface UpdateModalProps {
    update: UpdateInfo
    onDismiss: () => void
}

function UpdateModal({ update, onDismiss }: UpdateModalProps) {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    const handleUpdate = () => {
        window.electronAPI.downloadUpdate()
    }

    const handleDismiss = () => {
        setDismissed(true)
        onDismiss()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />

            {/* Modal */}
            <div className="relative bg-[#1e1e2e] text-gray-200 rounded-xl shadow-2xl w-[420px] overflow-hidden animate-slide-up">
                {/* Header accent */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400" />

                {/* Content */}
                <div className="px-6 py-5">
                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">새 업데이트 발견</h2>
                            <p className="text-sm text-gray-400">v{update.version} 버전이 출시되었습니다</p>
                        </div>
                    </div>

                    {/* Status area */}
                    {update.status === 'available' && (
                        <div className="bg-white/5 rounded-lg p-3 mb-5">
                            <p className="text-sm text-gray-300">
                                새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?
                            </p>
                        </div>
                    )}

                    {update.status === 'downloading' && (
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-300">다운로드 중...</p>
                                <span className="text-xs text-gray-400 font-mono">{update.progress ?? 0}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                                    style={{ width: `${update.progress ?? 0}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {update.status === 'ready' && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-5">
                            <p className="text-sm text-green-300">
                                ✓ 다운로드 완료! 재시작하면 업데이트가 적용됩니다.
                            </p>
                        </div>
                    )}

                    {update.status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-5">
                            <p className="text-sm text-red-300">
                                업데이트 다운로드 실패: {update.error || '알 수 없는 오류'}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        {update.status === 'available' && (
                            <>
                                <button
                                    onClick={handleDismiss}
                                    className="flex-1 py-2 px-4 text-sm text-gray-400 hover:text-gray-200 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    나중에
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                >
                                    지금 업데이트
                                </button>
                            </>
                        )}

                        {update.status === 'downloading' && (
                            <button
                                disabled
                                className="flex-1 py-2 px-4 text-sm text-gray-400 bg-white/5 rounded-lg cursor-not-allowed"
                            >
                                다운로드 중...
                            </button>
                        )}

                        {update.status === 'ready' && (
                            <button
                                onClick={() => window.electronAPI.installUpdate()}
                                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                            >
                                지금 재시작
                            </button>
                        )}

                        {update.status === 'error' && (
                            <button
                                onClick={handleDismiss}
                                className="flex-1 py-2 px-4 text-sm text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                닫기
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateModal
