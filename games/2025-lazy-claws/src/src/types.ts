declare global {
  interface Window {
    zzfx: (...args: any[]) => any;
    zzfxM: (...args: any[]) => any;
    zzfxP: (...args: any[]) => any;
    zzfxX: {
      suspend: () => Promise<void>;
    }
  }
}