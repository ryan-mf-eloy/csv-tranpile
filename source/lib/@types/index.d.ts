declare module "csv-transpile";

export type TObjectToCSV = {
  [TableHeader in string | number]: number | number[] | string | string[];
};

export type TSeparators = "=" | "," | ";" | ":" | " " | "\t";

export interface ISaveConfigs {
  readonly path?: string;
  readonly filename?: string;
  readonly dirName?: string;
  readonly maxFiles?: number | false;
  readonly replace?: boolean;
}

export interface ITranspilerToCSVConfigs {
  readonly separator?: TSeparators;
  readonly save?: ISaveConfigs;
}

export interface ToCSVParameters {
  readonly objectToCSV: TObjectToCSV | TObjectToCSV[];
  readonly configs?: ITranspilerToCSVConfigs;
}

export interface ITranspiler {
  toCSV(data: ToCSVParameters): string;

  toObject(CSVToObject: string): TObjectToCSV | TObjectToCSV[];
}

export interface ITranspilerToCSV {
  handle(data: ToCSVParameters): string;
}

export interface ITranspilerToObject {
  handle(CSVToObject: string, isArray?: string[]): TObjectToCSV | TObjectToCSV[];
}
