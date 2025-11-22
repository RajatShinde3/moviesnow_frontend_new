// app/settings/devices/page.tsx
/**
 * =============================================================================
 * Device & Session Management Page
 * =============================================================================
 * Features:
 * - View active sessions
 * - Device management
 * - Sign out from devices
 * - Download history
 */

import { DeviceManager } from "@/components/DeviceManager";

export const metadata = {
  title: "Devices & Sessions - MoviesNow",
  description: "Manage your active sessions and devices",
};

export default function DevicesPage() {
  return <DeviceManager />;
}
