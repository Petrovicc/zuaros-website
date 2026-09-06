import React from "react";
import ReactDOM from "react-dom/client";
import "./fonts.css";
import { App } from "./App";
import "./styles.css";
import "./polish.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
const isBrandPreview = new URLSearchParams(window.location.search).has(
  "brand-preview",
);

if (isBrandPreview) {
  const { BrandPreview } = await import("./brand/BrandPreview");
  root.render(
    <React.StrictMode>
      <BrandPreview />
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
