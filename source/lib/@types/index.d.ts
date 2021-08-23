declare module "csv-transpile";

export type ObjectToCSV = {
  [TableHeader in string | number]: number | number[] | string | string[];
};

export type Separators = "=" | "," | ";" | ":" | " " | "\t";

export interface SaveConfigs {
  readonly path?: string;
  readonly filename?: string;
  readonly dirName?: string;
  readonly maxFiles?: number | false;
  readonly replace?: boolean;
}

export interface TranspilerToCSVConfigs {
  readonly separator?: Separators;
  readonly save?: SaveConfigs;
}

export interface ToCSVParameters {
  readonly objectToCSV: ObjectToCSV | ObjectToCSV[];
  readonly configs?: TranspilerToCSVConfigs;
}

export interface ITranspiler {
  toCSV(data: ToCSVParameters): string;

  toObject(CSVToObject: string): ObjectToCSV | ObjectToCSV[];
}

export interface ITranspilerToCSV {
  handle(data: ToCSVParameters): string;
}

export interface ITranspilerToObject {
  handle(CSVToObject: string, isArray?: string[]): ObjectToCSV | ObjectToCSV[];
}
