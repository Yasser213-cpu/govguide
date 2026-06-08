import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";

import "./index.css";
import App from "./App.jsx";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",

  // ده “رابط المشروع على Sentry dashboard”

  tracesSampleRate: 1.0,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
