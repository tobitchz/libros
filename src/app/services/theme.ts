import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemePref = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'theme-preference';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private pref$ = new BehaviorSubject<ThemePref>('system');
  pref = this.pref$.asObservable();

  private mediaQuery = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  private mediaListener = (e: MediaQueryListEvent) => {
    if (this.getStoredPref() === 'system') this.applyPref('system');
  };

  constructor() {
    const stored = this.getStoredPref();
      console.log('[ThemeService] constructor stored=', stored);
    this.pref$.next(stored);
    this.applyPref(stored);
    this.mediaQuery?.addEventListener('change', this.mediaListener);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.getPref() === 'system') this.applyPref('system');
    });
  }

  setPref(p: ThemePref) {
    console.log('[ThemeService] setPref', p);
    localStorage.setItem(STORAGE_KEY, p);
    this.pref$.next(p);
    this.applyPref(p);
  }

  getPref(): ThemePref {
    return this.pref$.value;
  }

  private getStoredPref(): ThemePref {
    const v = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
    return v ?? 'system';
  }

  private applyPref(p: ThemePref) {
  const isDark = p === 'dark' ? true : p === 'light' ? false : (this.mediaQuery ? this.mediaQuery.matches : false);

  const html = document.documentElement;
  const body = document.body;
  const ionApp = document.querySelector('ion-app');

  const forceLight = p === 'light';
  html.classList.toggle('force-light', isDark);
  body.classList.toggle('force-light', forceLight);
  ionApp?.classList.toggle('force-light', forceLight);

  [html, body, ionApp!].forEach(el => {
    if (!el) return;
    el.classList.remove('dark', 'force-light');
  });

  if (isDark) {
    html.classList.add('dark'); body.classList.add('dark'); ionApp?.classList.add('dark');
  } else if (forceLight) {
    html.classList.add('force-light'); body.classList.add('force-light'); ionApp?.classList.add('force-light');
  }

  console.log('[ThemeService] applyPref', { p, isDark, classes: {
    html: html.className, body: body.className, ionApp: ionApp?.className
  }});
}

  destroy() {
    this.mediaQuery?.removeEventListener('change', this.mediaListener);
  }
}