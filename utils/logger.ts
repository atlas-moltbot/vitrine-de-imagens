/**
 * Sistema de Logging Centralizado
 * Gerencia logs de desenvolvimento e produção de forma segura
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDev = import.meta.env.MODE === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Limite para não ocupar muita memória

  private createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove o mais antigo
    }
  }

  /**
   * Log de informação (apenas em dev)
   */
  info(message: string, data?: any) {
    const entry = this.createEntry('info', message, data);
    this.addLog(entry);
    
    if (this.isDev) {
      console.log(`ℹ️ ${message}`, data || '');
    }
  }

  /**
   * Log de warning (apenas em dev)
   */
  warn(message: string, data?: any) {
    const entry = this.createEntry('warn', message, data);
    this.addLog(entry);
    
    if (this.isDev) {
      console.warn(`⚠️ ${message}`, data || '');
    }
  }

  /**
   * Log de erro (sempre loga, mas só mostra console em dev)
   */
  error(message: string, data?: any) {
    const entry = this.createEntry('error', message, data);
    this.addLog(entry);
    
    if (this.isDev) {
      console.error(`❌ ${message}`, data || '');
    }
    
    // Em produção, você poderia enviar para um serviço de monitoramento:
    // this.sendToMonitoring(entry);
  }

  /**
   * Log de debug (apenas em dev)
   */
  debug(message: string, data?: any) {
    if (!this.isDev) return;
    
    const entry = this.createEntry('debug', message, data);
    this.addLog(entry);
    console.debug(`🔍 ${message}`, data || '');
  }

  /**
   * Obtém todos os logs (útil para debug)
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Limpa todos os logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Exporta logs como JSON (útil para relatórios de bug)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Método privado que pode ser usado no futuro para enviar logs para serviço externo
  private sendToMonitoring(entry: LogEntry) {
    // TODO: Integrar com serviço de monitoramento (Sentry, LogRocket, etc)
    // fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
  }
}

// Exporta instância singleton
export const logger = new Logger();

// Exporta também o tipo para uso em outros arquivos
export type { LogEntry, LogLevel };
