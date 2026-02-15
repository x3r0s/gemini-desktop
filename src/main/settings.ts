import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export interface AppSettings {
  closeToTray: boolean
  launchAtStartup: boolean
  alwaysOnTop: boolean
  language?: string
}

const DEFAULTS: AppSettings = {
  closeToTray: true,
  launchAtStartup: false,
  alwaysOnTop: false,
  language: getDefaultLanguage()
}

function getDefaultLanguage(): string {
  const supportedLangs = ['en', 'ko', 'zh', 'ja']
  const locale = app.getLocale().split('-')[0] // 'ko-KR' -> 'ko'
  return supportedLangs.includes(locale) ? locale : 'en'
}

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

export function getSettings(): AppSettings {
  try {
    const raw = fs.readFileSync(getSettingsPath(), 'utf-8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const updated = { ...current, ...partial }
  fs.writeFileSync(getSettingsPath(), JSON.stringify(updated, null, 2))
  return updated
}
