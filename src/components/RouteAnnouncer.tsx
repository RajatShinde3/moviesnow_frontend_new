"use client";

import * as React from "react";

/**
 * Announces route changes to screen readers without visual noise.
 */
export default function RouteAnnouncer() {
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    const announce = () => setMessage(document.title || "Page updated");
    announce();
    const onPop = () => announce();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

