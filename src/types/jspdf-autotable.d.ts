declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    theme?: "striped" | "grid" | "plain";
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    columnStyles?: any;
    margin?: any;
    pageBreak?: string;
    rowPageBreak?: string;
    tableWidth?: string | number;
    showHead?: boolean | "firstPage" | "everyPage" | "never";
    showFoot?: boolean | "lastPage" | "everyPage" | "never";
    tableLineColor?: number | number[];
    tableLineWidth?: number;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): void;
}
