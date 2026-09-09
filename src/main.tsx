import React from "react";
import ReactDOM from "react-dom/client";
import "./fonts.css";
import { App } from "./App";
import "./styles.css";
import "./polish.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

const currentUrl = new URL(window.location.href);
if (currentUrl.searchParams.has("brand-preview")) {
  currentUrl.searchParams.delete("brand-preview");
  currentUrl.searchParams.delete("intro");
  window.history.replaceState(
    window.history.state,
    "",
    `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
  );
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
