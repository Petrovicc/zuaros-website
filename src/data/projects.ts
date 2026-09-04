import type { Language } from "../i18n/useLanguage";

export type LocalizedText = Record<Language, string>;
export interface Project {
  id: string;
  title: LocalizedText;
  category: LocalizedText;
  description: LocalizedText;
  kind: "software" | "engineering" | "research" | "game";
  technologies: string[];
  image?: { src: string; alt: LocalizedText };
  status: "concept" | "development" | "released";
  platforms?: string[];
  links?: {
    website?: string;
    github?: string;
    steam?: string;
    playStore?: string;
  };
}

// Publish verified, approved project information here. No invented projects or clients.
export const projects: Project[] = [];
