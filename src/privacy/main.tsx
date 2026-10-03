import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { PrivacyPage } from "./PrivacyPage";
import type { Policy } from "./types";
import "../fonts.css";
import "../styles.css";
import "../polish.css";
import "./privacy.css";

const root = document.getElementById("root")!;
const policy: Policy | null = JSON.parse(document.getElementById("privacy-data")!.textContent!);
const page = <StrictMode><PrivacyPage policy={policy} /></StrictMode>;
if (root.querySelector("main")) hydrateRoot(root, page);
else createRoot(root).render(page);
