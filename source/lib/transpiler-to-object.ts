import fs from "fs";

import { acceptedSeparators } from "@lib/.";

import {
  ITranspilerToObject,
  ObjectToCSV,
  Separators,
} from "@lib/@types/index.d";

class TranspilerToObject implements ITranspilerToObject {
  private CSVString!: string;

  private CSVObject: ObjectToCSV[] = [];

  private CSVStringRows!: string[];

  private separator!: Separators;

  handle(CSVToObject: string, isArray?: string[]): ObjectToCSV | ObjectToCSV[] {
    this.validateCSVToObjectType(CSVToObject);

    this.setCSVStringRows();
    this.identifierCSVSeparator();

    const createdEmptyObjects = this.createEmptyObjectsEachRows();
    this.CSVObject = [...createdEmptyObjects];

    this.CSVStringRows.forEach((CSVRow: string, rowIndex: number) => {
      const isNotTableHeaderRow = rowIndex !== 0;

      if (isNotTableHeaderRow) {
        const objectValues = this.getObjectValues(CSVRow);

        objectValues.forEach((value, valueIndex) =>
          this.setValuesInEmptyObjects(value, valueIndex, rowIndex)
        );
      }
    });

    if (isArray) this.setArrayValues(isArray);

    return this.CSVObject.length === 1 ? this.CSVObject[0] : this.CSVObject;
  }

  private setArrayValues(isArray: string[]) {
    this.CSVObject.map((object) => {
      isArray.forEach((arrayValue) => {
        const existArrayValueInObject =
          Object.keys(object).includes(arrayValue);

        if (!existArrayValueInObject)
          throw new Error(`${arrayValue} not exist in object!`);

        const cleanValue = this.removeStringFormattation(
          object[arrayValue] as string
        );

        object[arrayValue] = cleanValue.split(",");
      });
    });
  }

  private setValuesInEmptyObjects(
    value: string,
    valueIndex: number,
    rowIndex: number
  ) {
    const objectKeys = this.getObjectKeys(this.CSVStringRows);

    const keyName = this.removeStringFormattation(objectKeys[valueIndex]);
    const objectReference = rowIndex - 1;

    this.CSVObject[objectReference][keyName] = value;
  }

  private createEmptyObjectsEachRows(): {}[] {
    const CSVStringRowsWithoutHeaderTable = [...this.CSVStringRows].slice(
      0,
      this.CSVStringRows.length - 1
    );
    return CSVStringRowsWithoutHeaderTable.map(() => ({}));
  }

  private getObjectValues(CSVRow: string): string[] {
    const CSVRowValues = CSVRow.split(this.separator);
    return CSVRowValues;
  }

  private getObjectKeys(CSVRows: string[]): string[] {
    const tableHeader = CSVRows[0];
    const headerValues = tableHeader.split(this.separator);

    return this.filterOnlyString(headerValues);
  }

  private removeStringFormattation(str: string) {
    return str.replace(/[\r|\t|\n|\"]/g, "");
  }

  private filterOnlyString(array: string[]) {
    return array.filter((value: string) => {
      const cleanValue = this.removeStringFormattation(value).trim();

      if (cleanValue) return cleanValue;
    });
  }

  private identifierCSVSeparator(): void {
    acceptedSeparators.forEach((separator) => {
      const splitedValuesArray = this.CSVStringRows[0].split(separator);

      // Caso tenha só um campo vai bugar!!

      if (splitedValuesArray.length > 1) this.setSeparator(separator);
    });
  }

  private setCSVString(str: string): void {
    this.CSVString = str;
  }

  private setCSVStringRows() {
    this.CSVStringRows = this.CSVString.split("\n");
  }

  private setSeparator(separator: Separators): void {
    this.separator = separator;
  }

  private isCSVFile(fileContent: string): boolean {
    // Validar se é um CSV
    return true;
  }

  private validateCSVToObjectType(CSVToObject: string): void {
    const isFilePath = fs.existsSync(CSVToObject);

    if (isFilePath)
      try {
        const fileContent = fs.readFileSync(CSVToObject, "utf-8");

        if (this.isCSVFile(fileContent)) this.setCSVString(fileContent.trim());
        else throw new Error("The file is not CSV.");
      } catch (err) {
        throw new Error(
          `Error when trying to read the contents of the file. FileSystem error: ${err}`
        );
      }
    else this.setCSVString(CSVToObject);
  }
}

export default TranspilerToObject;
