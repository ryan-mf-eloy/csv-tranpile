import TranspilerToCSV from "./transpiler-to-csv";
import TranspilerToObject from "./transpiler-to-object";

import {
  ITranspiler,
  ObjectToCSV,
  Separators,
  ToCSVParameters,
} from "./@types/index.d";

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
