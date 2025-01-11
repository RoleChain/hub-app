import * as data from "./data.ts";

export type Mission = {
  id: string;
  title: string;
  description: string;
  categories: string[];
  contributions: {
    contributedAt: string;
    id: number;
    link: string;
    metadata: {
      authors: {
        name: string;
        affiliation: string;
      }[];
      doi: string;
      journal: string;
      publishedDate: string;
      publisher: string;
      title: string;
    };
  }[];
  reward: number;
};

export type searchResponse = {
  answer: string;
  sources?: { [key: string]: string }[];
};

export type ResearchType = "general" | "document" | "report";

export { data };
