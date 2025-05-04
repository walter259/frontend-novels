export function getLocalStorage(name: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  }
  
  export function setLocalStorage(name: string, value: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  }
  
  export function removeLocalStorage(name: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  }