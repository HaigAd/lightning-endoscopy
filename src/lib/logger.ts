export type LogLevel = 'off' | 'simple' | 'verbose'

export class Logger {
  private static instance: Logger
  private level: LogLevel = 'off'

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setLevel(level: LogLevel) {
    this.level = level
  }

  getLevel(): LogLevel {
    return this.level
  }

  private formatValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  private shouldLog(messageLevel: 'simple' | 'verbose'): boolean {
    if (this.level === 'off') return false
    if (this.level === 'simple') return messageLevel === 'simple'
    return true // verbose logs everything
  }

  debug(message: string, context?: any) {
    if (this.shouldLog('verbose')) {
      console.debug(`[DEBUG] ${message}${context ? '\n' + this.formatValue(context) : ''}`)
    }
  }

  info(message: string, context?: any) {
    if (this.shouldLog('simple')) {
      console.info(`[INFO] ${message}${context ? '\n' + this.formatValue(context) : ''}`)
    }
  }

  warn(message: string, context?: any) {
    if (this.shouldLog('simple')) {
      console.warn(`[WARN] ${message}${context ? '\n' + this.formatValue(context) : ''}`)
    }
  }

  error(message: string, context?: any) {
    // Always log errors regardless of level
    console.error(`[ERROR] ${message}${context ? '\n' + this.formatValue(context) : ''}`)
  }
}

export const logger = Logger.getInstance()
export default logger
