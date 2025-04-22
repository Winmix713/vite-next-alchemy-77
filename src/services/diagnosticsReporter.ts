
interface DiagnosticError {
  id: string;
  timestamp: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  file?: string;
  line?: number;
  column?: number;
  stackTrace?: string;
  suggestions?: string[];
}

interface DiagnosticReport {
  conversionId: string;
  timestamp: number;
  errors: DiagnosticError[];
  warnings: DiagnosticError[];
  infos: DiagnosticError[];
  summary: {
    totalErrors: number;
    totalWarnings: number;
    totalInfos: number;
    criticalIssues: number;
  };
}

/**
 * Hibajelentési és diagnosztikai rendszer
 * A konverzió során fellépő hibák részletes kezelésére és jelentésére
 */
export class DiagnosticsReporter {
  private errors: DiagnosticError[] = [];
  private warnings: DiagnosticError[] = [];
  private infos: DiagnosticError[] = [];
  private conversionId: string;
  private startTime: number;
  
  constructor() {
    this.conversionId = this.generateId();
    this.startTime = Date.now();
  }
  
  /**
   * Hibák hozzáadása a jelentéshez
   */
  addError(message: string, options?: Partial<DiagnosticError>): void {
    const error: DiagnosticError = {
      id: this.generateId(),
      timestamp: Date.now(),
      severity: 'error',
      message,
      code: options?.code || 'E_UNKNOWN',
      file: options?.file,
      line: options?.line,
      column: options?.column,
      stackTrace: options?.stackTrace,
      suggestions: options?.suggestions || this.generateSuggestions(message, 'error')
    };
    
    this.errors.push(error);
    console.error(`[HIBA] ${message}`, options?.file ? `(${options.file})` : '');
    
    return error;
  }
  
  /**
   * Figyelmeztetések hozzáadása a jelentéshez
   */
  addWarning(message: string, options?: Partial<DiagnosticError>): void {
    const warning: DiagnosticError = {
      id: this.generateId(),
      timestamp: Date.now(),
      severity: 'warning',
      message,
      code: options?.code || 'W_UNKNOWN',
      file: options?.file,
      line: options?.line,
      column: options?.column,
      stackTrace: options?.stackTrace,
      suggestions: options?.suggestions || this.generateSuggestions(message, 'warning')
    };
    
    this.warnings.push(warning);
    console.warn(`[FIGYELMEZTETÉS] ${message}`, options?.file ? `(${options.file})` : '');
    
    return warning;
  }
  
  /**
   * Információk hozzáadása a jelentéshez
   */
  addInfo(message: string, options?: Partial<DiagnosticError>): void {
    const info: DiagnosticError = {
      id: this.generateId(),
      timestamp: Date.now(),
      severity: 'info',
      message,
      code: options?.code || 'I_INFO',
      file: options?.file,
      line: options?.line,
      column: options?.column,
      stackTrace: options?.stackTrace,
      suggestions: options?.suggestions
    };
    
    this.infos.push(info);
    console.info(`[INFO] ${message}`, options?.file ? `(${options.file})` : '');
    
    return info;
  }
  
  /**
   * Jelentés generálása az összegyűjtött hibákból és figyelmeztetésekből
   */
  generateReport(): DiagnosticReport {
    const criticalIssues = this.errors.filter(e => 
      e.code.startsWith('E_CRITICAL') || 
      e.code.startsWith('E_FATAL')
    ).length;
    
    return {
      conversionId: this.conversionId,
      timestamp: Date.now(),
      errors: this.errors,
      warnings: this.warnings,
      infos: this.infos,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalInfos: this.infos.length,
        criticalIssues
      }
    };
  }
  
  /**
   * HTML formátumú jelentés készítése
   */
  generateHTMLReport(): string {
    const report = this.generateReport();
    
    const criticalClass = report.summary.totalErrors > 0 ? 'critical' : 
                         report.summary.totalWarnings > 0 ? 'warning' : 'success';
    
    return `
      <!DOCTYPE html>
      <html lang="hu">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Next.js to Vite Konverzió Jelentés</title>
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 20px; }
          .report-header { text-align: center; margin-bottom: 30px; }
          .report-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .summary-card { padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .critical { background-color: #FEE2E2; border-left: 4px solid #DC2626; }
          .warning { background-color: #FEF3C7; border-left: 4px solid #D97706; }
          .success { background-color: #D1FAE5; border-left: 4px solid #10B981; }
          .info { background-color: #DBEAFE; border-left: 4px solid #3B82F6; }
          .issue-list { margin-top: 30px; }
          .issue-item { padding: 15px; margin-bottom: 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .issue-code { font-family: monospace; display: inline-block; padding: 2px 6px; background: #f1f1f1; border-radius: 4px; }
          .issue-location { color: #666; font-size: 0.9em; margin-top: 5px; }
          .suggestion { margin-top: 10px; padding: 8px 12px; background: #f8f9fa; border-radius: 4px; font-style: italic; }
          .timestamp { color: #666; font-size: 0.8em; }
          .tab-container { margin-top: 20px; }
          .tabs { display: flex; gap: 2px; margin-bottom: 10px; }
          .tab { padding: 10px 20px; cursor: pointer; border-radius: 6px 6px 0 0; }
          .tab.active { font-weight: bold; }
          .tab-content { display: none; }
          .tab-content.active { display: block; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>Next.js to Vite Konverzió Jelentés</h1>
          <p>Konverzió azonosító: ${report.conversionId}</p>
          <p>Generálva: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="report-summary">
          <div class="summary-card ${criticalClass}">
            <h3>Összefoglaló</h3>
            <p><strong>${report.summary.totalErrors}</strong> hiba</p>
            <p><strong>${report.summary.totalWarnings}</strong> figyelmeztetés</p>
            <p><strong>${report.summary.totalInfos}</strong> információ</p>
          </div>
          
          <div class="summary-card ${report.summary.criticalIssues > 0 ? 'critical' : 'info'}">
            <h3>Kritikus problémák</h3>
            <p><strong>${report.summary.criticalIssues}</strong> kritikus probléma</p>
            ${report.summary.criticalIssues > 0 ? 
              `<p>❗ Súlyos hibák miatt a konverzió esetleg nem működik megfelelően!</p>` : 
              `<p>✅ Nincsenek kritikus problémák</p>`
            }
          </div>
          
          <div class="summary-card info">
            <h3>Futási adatok</h3>
            <p><strong>Kezdés:</strong> ${new Date(this.startTime).toLocaleTimeString()}</p>
            <p><strong>Befejezés:</strong> ${new Date(report.timestamp).toLocaleTimeString()}</p>
            <p><strong>Időtartam:</strong> ${Math.round((report.timestamp - this.startTime) / 1000)} másodperc</p>
          </div>
        </div>
        
        <div class="tab-container">
          <div class="tabs">
            <div class="tab active critical" onclick="openTab(event, 'errors')">Hibák (${report.summary.totalErrors})</div>
            <div class="tab warning" onclick="openTab(event, 'warnings')">Figyelmeztetések (${report.summary.totalWarnings})</div>
            <div class="tab info" onclick="openTab(event, 'infos')">Információk (${report.summary.totalInfos})</div>
          </div>
          
          <div id="errors" class="tab-content active">
            <div class="issue-list">
              ${report.errors.length === 0 ? '<p>Nincsenek hibák! ✅</p>' : ''}
              ${report.errors.map(error => `
                <div class="issue-item critical">
                  <div>
                    <span class="issue-code">${error.code}</span>
                    <strong>${error.message}</strong>
                  </div>
                  ${error.file ? `
                    <div class="issue-location">
                      File: ${error.file}${error.line ? `:${error.line}${error.column ? `:${error.column}` : ''}` : ''}
                    </div>
                  ` : ''}
                  ${error.suggestions && error.suggestions.length > 0 ? `
                    <div>
                      ${error.suggestions.map(s => `<div class="suggestion">💡 ${s}</div>`).join('')}
                    </div>
                  ` : ''}
                  <div class="timestamp">
                    Időbélyeg: ${new Date(error.timestamp).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div id="warnings" class="tab-content">
            <div class="issue-list">
              ${report.warnings.length === 0 ? '<p>Nincsenek figyelmeztetések! ✅</p>' : ''}
              ${report.warnings.map(warning => `
                <div class="issue-item warning">
                  <div>
                    <span class="issue-code">${warning.code}</span>
                    <strong>${warning.message}</strong>
                  </div>
                  ${warning.file ? `
                    <div class="issue-location">
                      File: ${warning.file}${warning.line ? `:${warning.line}${warning.column ? `:${warning.column}` : ''}` : ''}
                    </div>
                  ` : ''}
                  ${warning.suggestions && warning.suggestions.length > 0 ? `
                    <div>
                      ${warning.suggestions.map(s => `<div class="suggestion">💡 ${s}</div>`).join('')}
                    </div>
                  ` : ''}
                  <div class="timestamp">
                    Időbélyeg: ${new Date(warning.timestamp).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div id="infos" class="tab-content">
            <div class="issue-list">
              ${report.infos.length === 0 ? '<p>Nincsenek információk</p>' : ''}
              ${report.infos.map(info => `
                <div class="issue-item info">
                  <div>
                    <span class="issue-code">${info.code}</span>
                    <strong>${info.message}</strong>
                  </div>
                  ${info.file ? `
                    <div class="issue-location">
                      File: ${info.file}${info.line ? `:${info.line}${info.column ? `:${info.column}` : ''}` : ''}
                    </div>
                  ` : ''}
                  <div class="timestamp">
                    Időbélyeg: ${new Date(info.timestamp).toLocaleString()}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <script>
          function openTab(evt, tabName) {
            const tabContents = document.getElementsByClassName("tab-content");
            for (let i = 0; i < tabContents.length; i++) {
              tabContents[i].className = tabContents[i].className.replace(" active", "");
            }
            
            const tabs = document.getElementsByClassName("tab");
            for (let i = 0; i < tabs.length; i++) {
              tabs[i].className = tabs[i].className.replace(" active", "");
            }
            
            document.getElementById(tabName).className += " active";
            evt.currentTarget.className += " active";
          }
        </script>
      </body>
      </html>
    `;
  }
  
  /**
   * A jelentés JSON formátumú exportálása
   */
  exportToJson(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }
  
  /**
   * Egyedi azonosító generálása
   */
  private generateId(): string {
    return `diag-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  
  /**
   * Automatikus javaslatok generálása a hibaüzenetek alapján
   */
  private generateSuggestions(message: string, type: 'error' | 'warning'): string[] {
    const suggestions: string[] = [];
    
    // Gyakori hibaüzenetekhez automatikus javaslatok
    if (message.includes('import') && message.includes('not found')) {
      suggestions.push('Ellenőrizd a behúzott modul nevét és elérési útját.');
      suggestions.push('Telepítsd a hiányzó csomagot: npm install <package-name>');
    } 
    else if (message.includes('middleware') || message.includes('Middleware')) {
      suggestions.push('A Next.js middleware helyett használj Express/Fastify middleware-t.');
      suggestions.push('Edge middleware esetén használj service workert vagy Cloudflare Workert.');
    }
    else if (message.includes('getServerSideProps') || message.includes('getStaticProps')) {
      suggestions.push('Használj React Query vagy SWR könyvtárat az adatlekérésekhez.');
      suggestions.push('Alakítsd át a szerveroldali lekéréseket kliensoldali hook-ká.');
    }
    else if (message.includes('_app') || message.includes('_document')) {
      suggestions.push('Hozz létre egy App.tsx gyökér komponenst a _app.tsx/js helyett.');
      suggestions.push('Használj index.html fájlt a _document.tsx/js helyett.');
    }
    
    // Típus szerint generálunk további javaslatokat
    if (type === 'error') {
      suggestions.push('Ellenőrizd a konverziós naplókat további részletekért.');
      suggestions.push('Fontold meg a probléma manuális javítását, ha a konverzió nem kezeli megfelelően.');
    }
    
    return suggestions;
  }
  
  /**
   * Összes hibaadat törlése
   */
  clear(): void {
    this.errors = [];
    this.warnings = [];
    this.infos = [];
  }
  
  /**
   * A hibák, figyelmeztetések és információk számának lekérdezése
   */
  getCounts(): { errors: number, warnings: number, infos: number } {
    return {
      errors: this.errors.length,
      warnings: this.warnings.length,
      infos: this.infos.length
    };
  }
}

// Példa használat:
// const diagnostics = new DiagnosticsReporter();
// diagnostics.addError('Hiba történt', { file: 'src/app.js', line: 42 });
// diagnostics.addWarning('Ez egy figyelmeztetés');
// const report = diagnostics.generateReport();
