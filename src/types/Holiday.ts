export interface Holiday {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  date: Date;
}