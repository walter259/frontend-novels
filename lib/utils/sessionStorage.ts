export const setSessionStorage = (key: string, value: string) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(key, value);
    }
};

export function getSessionStorage(name: string): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(name);
  }
  
  export function removeSessionStorage(name: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(name);
  }