// lib/pwa.ts
/**
 * =============================================================================
 * PWA Utilities - Service Worker Registration & Features
 * =============================================================================
 */

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.log("Service workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("Service worker registered:", registration.scope);

    // Check for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // New version available
          console.log("New version available");
          if (
            confirm(
              "A new version is available! Reload to update?"
            )
          ) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
          }
        }
      });
    });

    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

/**
 * Check if app is installed as PWA
 */
export function isPWA(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

/**
 * Prompt user to install PWA
 */
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // Check if already installed
    setIsInstalled(isPWA());

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return false;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      console.log("User accepted install");
      setInstallPrompt(null);
      return true;
    }

    return false;
  };

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    promptInstall,
  };
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log("Notification permission denied");
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
      ),
    });

    console.log("Push subscription created");
    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push:", error);
    return null;
  }
}

/**
 * Cache content for offline viewing
 */
export async function cacheForOffline(
  url: string,
  id: string
): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const sw = registration.active;

  if (!sw) return false;

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      if (event.data.type === "CACHE_COMPLETE") {
        resolve(true);
      }
    };

    sw.postMessage(
      {
        type: "CACHE_DOWNLOAD",
        url,
        id,
      },
      [messageChannel.port2]
    );

    // Timeout after 30 seconds
    setTimeout(() => resolve(false), 30000);
  });
}

/**
 * Check if content is cached
 */
export async function isContentCached(url: string): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) return false;

  try {
    const cache = await caches.open("downloads-v1");
    const response = await cache.match(url);
    return !!response;
  } catch {
    return false;
  }
}

/**
 * Get cache storage usage
 */
export async function getCacheStorage(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  if (typeof window === "undefined" || !("storage" in navigator)) {
    return { usage: 0, quota: 0, percentUsed: 0 };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentUsed };
  } catch {
    return { usage: 0, quota: 0, percentUsed: 0 };
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
}

// Helper function
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

import * as React from "react";
