
interface PerformanceMetrics {
  buildTime: number;
  bundleSize: {
    before: number;
    after: number;
    difference: number;
  };
  loadTime: {
    before: number;
    after: number;
    improvement: number;
  };
  memoryUsage: number;
}

interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
}

/**
 * Teljesítmény monitorozás a konvertált alkalmazások számára
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private endTime: number = 0;
  private metrics: Partial<PerformanceMetrics> = {};
  private webVitals: Partial<WebVitalsMetrics> = {};
  
  /**
   * Konverzió kezdetének időbélyegzése
   */
  startMeasurement(): void {
    this.startTime = performance.now();
    console.log('Teljesítménymérés elindítva');
  }
  
  /**
   * Konverzió befejezésének időbélyegzése
   */
  endMeasurement(): void {
    this.endTime = performance.now();
    this.metrics.buildTime = this.endTime - this.startTime;
    console.log(`Teljesítménymérés befejezve: ${this.metrics.buildTime.toFixed(2)}ms`);
  }
  
  /**
   * Bundle méret összehasonlítása előtte/utána
   * @param beforeSize Konverzió előtti méret bájtban
   * @param afterSize Konverzió utáni méret bájtban
   */
  setBundleSizeComparison(beforeSize: number, afterSize: number): void {
    this.metrics.bundleSize = {
      before: beforeSize,
      after: afterSize,
      difference: beforeSize - afterSize
    };
    
    const diffPercentage = ((beforeSize - afterSize) / beforeSize * 100).toFixed(2);
    console.log(`Bundle méret változás: ${diffPercentage}% (${this.formatBytes(beforeSize)} → ${this.formatBytes(afterSize)})`);
  }
  
  /**
   * Betöltési idő összehasonlítása előtte/utána
   * @param beforeLoadTime Konverzió előtti betöltési idő milliszekundumban
   * @param afterLoadTime Konverzió utáni betöltési idő milliszekundumban
   */
  setLoadTimeComparison(beforeLoadTime: number, afterLoadTime: number): void {
    this.metrics.loadTime = {
      before: beforeLoadTime,
      after: afterLoadTime,
      improvement: ((beforeLoadTime - afterLoadTime) / beforeLoadTime) * 100
    };
    
    console.log(`Betöltési idő javulás: ${this.metrics.loadTime.improvement.toFixed(2)}%`);
  }
  
  /**
   * Web Vitals metrikák beállítása
   * @param metrics Web Vitals metrikák objektuma
   */
  setWebVitalsMetrics(metrics: Partial<WebVitalsMetrics>): void {
    this.webVitals = { ...this.webVitals, ...metrics };
    console.log('Web Vitals metrikák frissítve');
  }
  
  /**
   * Teljesítményjelentés generálása
   */
  generateReport(): string {
    return `
# Teljesítmény Jelentés

## Konverzió Metrikák
- Konverziós idő: ${this.metrics.buildTime ? this.metrics.buildTime.toFixed(2) + 'ms' : 'Nincs mérve'}
- Memóriahasználat: ${this.metrics.memoryUsage ? this.formatBytes(this.metrics.memoryUsage) : 'Nincs mérve'}

## Bundle Metrikák
${this.metrics.bundleSize ? `
- Konverzió előtt: ${this.formatBytes(this.metrics.bundleSize.before)}
- Konverzió után: ${this.formatBytes(this.metrics.bundleSize.after)}
- Különbség: ${this.formatBytes(Math.abs(this.metrics.bundleSize.difference))} (${(this.metrics.bundleSize.difference > 0 ? '-' : '+')}${((Math.abs(this.metrics.bundleSize.difference) / this.metrics.bundleSize.before) * 100).toFixed(2)}%)
` : '- Bundle méretek: Nincs mérve'}

## Betöltési Teljesítmény
${this.metrics.loadTime ? `
- Konverzió előtt: ${this.metrics.loadTime.before.toFixed(2)}ms
- Konverzió után: ${this.metrics.loadTime.after.toFixed(2)}ms
- Javulás: ${this.metrics.loadTime.improvement.toFixed(2)}%
` : '- Betöltési idők: Nincs mérve'}

## Web Vitals
- LCP: ${this.webVitals.lcp ? this.webVitals.lcp.toFixed(2) + 'ms' : 'Nincs mérve'}
- FID: ${this.webVitals.fid ? this.webVitals.fid.toFixed(2) + 'ms' : 'Nincs mérve'}
- CLS: ${this.webVitals.cls ? this.webVitals.cls.toFixed(4) : 'Nincs mérve'}
- TTFB: ${this.webVitals.ttfb ? this.webVitals.ttfb.toFixed(2) + 'ms' : 'Nincs mérve'}
- FCP: ${this.webVitals.fcp ? this.webVitals.fcp.toFixed(2) + 'ms' : 'Nincs mérve'}

## Teljesítmény Javaslatok
- ${this.getPerformanceRecommendations()}
    `;
  }
  
  /**
   * Teljesítmény javaslatok generálása a metrikák alapján
   */
  private getPerformanceRecommendations(): string[] {
    const recommendations = [];
    
    if (this.metrics.bundleSize && this.metrics.bundleSize.difference < 0) {
      recommendations.push('Fontold meg a code splitting és lazy loading alkalmazását a bundle méret csökkentéséért.');
    }
    
    if (this.webVitals.lcp && this.webVitals.lcp > 2500) {
      recommendations.push('Az LCP értéke magas. Fontold meg a képek optimalizálását és a render-blokkoló erőforrások csökkentését.');
    }
    
    if (this.webVitals.cls && this.webVitals.cls > 0.1) {
      recommendations.push('A CLS értéke magas. Adj meg explicit méreteket a képeknek és más dinamikus elemeknek.');
    }
    
    if (recommendations.length === 0) {
      return ['Az alkalmazás teljesítménye megfelelő. Nincsenek specifikus javaslatok.'];
    }
    
    return recommendations;
  }
  
  /**
   * Bájtok formázása olvasható formátumban (KB, MB, stb.)
   * @param bytes Bájtok száma
   * @returns Formázott méret szövegként
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  /**
   * Metrikák visszaadása
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return this.metrics;
  }
  
  /**
   * Web Vitals visszaadása
   */
  getWebVitals(): Partial<WebVitalsMetrics> {
    return this.webVitals;
  }
  
  /**
   * Snapshot készítése az aktuális memóriahasználatról (csak ha a környezet támogatja)
   */
  captureMemoryUsage(): void {
    if (typeof performance !== 'undefined' && performance.memory) {
      // Csak Chrome-ban támogatott
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
      console.log(`Memóriahasználat: ${this.formatBytes(this.metrics.memoryUsage)}`);
    }
  }
}

// Példa használatra:
// const perfMonitor = new PerformanceMonitor();
// perfMonitor.startMeasurement();
// perfMonitor.endMeasurement();
// perfMonitor.generateReport();
