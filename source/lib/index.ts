import TranspilerToCSV from "@lib/transpiler-to-csv";
import TranspilerToObject from "@lib/transpiler-to-object";

import {
  ITranspiler,
  TObjectToCSV,
  TSeparators,
  ToCSVParameters,
} from "@lib/@types/index.d";

export const acceptedSeparators: TSeparators[] = ["=", ",", ";", ":", " ", "\t"];

class Transpiler implements ITranspiler {
  private readonly toCSVTranspiler = new TranspilerToCSV();

  private readonly toObjectTranspiler = new TranspilerToObject();

  toCSV(data: ToCSVParameters): string {
    const CSVString = this.toCSVTranspiler.handle(data);

    return CSVString;
  }

  toObject(
    CSVToObject: string,
    isArray?: string[]
  ): TObjectToCSV | TObjectToCSV[] {
    const CSVObject = this.toObjectTranspiler.handle(CSVToObject, isArray);

    return CSVObject;
  }
}

export default Transpiler;
