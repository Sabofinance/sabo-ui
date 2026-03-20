import React, { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

const TawkToWidget: React.FC = () => {
  useEffect(() => {
    const embedUrl = import.meta.env.VITE_TAWK_EMBED_URL ? String(import.meta.env.VITE_TAWK_EMBED_URL) : "";
    const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID ? String(import.meta.env.VITE_TAWK_PROPERTY_ID) : "";
    const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID ? String(import.meta.env.VITE_TAWK_WIDGET_ID) : "";

    const url =
      embedUrl ||
      (propertyId
        ? `https://embed.tawk.to/${propertyId}/${widgetId ? widgetId : "default"}`
        : "");

    if (!url) return;

    // Prevent injecting multiple times across route transitions.
    if (document.getElementById("tawk-to-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-to-script";
    script.async = true;
    script.src = url;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    // Insert before the first script tag (matches Tawk's recommended snippet pattern).
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.body.appendChild(script);
    }
  }, []);

  return null;
};

export default TawkToWidget;

