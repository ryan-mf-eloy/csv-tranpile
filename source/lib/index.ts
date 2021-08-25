import TranspilerToCSV from "@lib/transpiler-to-csv";
import TranspilerToObject from "@lib/transpiler-to-object";

import {
  ITranspiler,
  ObjectToCSV,
  Separators,
  ToCSVParameters,
} from "@lib/@types/index.d";

export const acceptedSeparators: Separators[] = ["=", ",", ";", ":", " ", "\t"];

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
  ): ObjectToCSV | ObjectToCSV[] {
    const CSVObject = this.toObjectTranspiler.handle(CSVToObject, isArray);

    return CSVObject;
  }
}

export default Transpiler;
