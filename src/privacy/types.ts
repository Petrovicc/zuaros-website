export interface Policy {
  app: string;
  slug: string;
  sourceUrl: string;
  sourceTitle: string;
  date: string;
  dateLabel: string;
  contact: string;
  links: { text: string; href: string }[];
  blocks: { type: "p" | "h2" | "li"; text: string }[];
}
