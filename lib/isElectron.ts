export function isElectron() {
  if (typeof window === "undefined") return false;
  return navigator.userAgent.toLowerCase().includes("electron");
}

export async function getElectronAppMode(): Promise<string | null> {
  if (!isElectron()) return null;
  
  try {
    // Access the electronAPI exposed by preload script
    const electronAPI = (window as any).electronAPI;
    if (electronAPI && electronAPI.getAppMode) {
      return await electronAPI.getAppMode();
    }
  } catch (error) {
    console.error('Failed to get app mode from Electron:', error);
  }
  
  return null;
}

export function isInstructorMode(): Promise<boolean> {
  return getElectronAppMode().then(mode => mode === 'instructor');
}
