export interface BaseData {
  type: string;
}

export interface BasicData extends BaseData {
  type: "basic";
  content: string;
}

export interface LanggraphButtonData extends BaseData {
  type: "langgraphButton";
  link: string;
}

export interface DifferencesData extends BaseData {
  type: "differences";
  content: string;
  output: string;
}

export interface QuestionData extends BaseData {
  type: "question";
  content: string;
}

export interface ChatData extends BaseData {
  type: "chat";
  content: string;
}

export interface LogsData extends BaseData {
  type: "logs";
  content: string;
  output: string;
  metadata: unknown;
  contentAndType: string;
}

export type Data =
  | BasicData
  | LanggraphButtonData
  | DifferencesData
  | QuestionData
  | ChatData
  | LogsData;

export type ReportType = "research_report" | "detailed_report";

export interface ChatBoxSettings {
  report_source: string;
  report_type: "general_chat" | "document_chat" | ReportType;
  tone: string;
}
