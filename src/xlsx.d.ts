declare module "xlsx" {
  export const utils: {
    sheet_to_json: <T>(sheet: unknown, opts?: Record<string, unknown>) => T;
    aoa_to_sheet: (data: unknown[][]) => Record<string, unknown>;
    book_new: () => WorkBook;
    book_append_sheet: (wb: WorkBook, ws: unknown, name: string) => void;
    sheet_to_csv: (sheet: unknown) => string;
  };
  export function read(data: ArrayBuffer | Uint8Array, opts?: Record<string, unknown>): WorkBook;
  export function write(wb: WorkBook, opts?: Record<string, unknown>): ArrayBuffer;
  export interface WorkBook {
    SheetNames: string[];
    Sheets: Record<string, Record<string, unknown>>;
  }
}
