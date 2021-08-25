import fs from "fs";
import path from "path";

import { acceptedSeparators } from "@lib/.";

import {
  ObjectToCSV,
  ToCSVParameters,
  TranspilerToCSVConfigs,
  ITranspilerToCSV,
} from "./@types/index.d";

class TranspilerToCSV implements ITranspilerToCSV {
  private CSVString: string = ``;

  private objectToCSV!: ObjectToCSV[];

  private configs: TranspilerToCSVConfigs = {
    separator: ",",
    save: {
      path: __dirname,
      filename: this.getCurrentMilliseconds(),
      dirName: "/",
      maxFiles: false,
      replace: false,
    },
  };

  private CSVDirPath!: string;

  private CSVFilePath!: string;

  /**
   * @Main
   */

  public handle(params: ToCSVParameters): string {
    this.setParameters(params);

    this.validateParameters();
    this.validateEachObjectToCSVValues();
    this.validateEachObjectToCSVKeys();

    this.objectToCSV.forEach((data, index) => {
      const isFirstIncrement = index === 0;
      if (isFirstIncrement) this.setTableHeaders(data);
      this.setTableValues(data);
    });

    if (params.configs?.save) this.saveCSVOnDisk();

    return this.CSVString;
  }

  /**
   * @Setting @class @variables
   */

  private setParameters(params: ToCSVParameters): void {
    const { objectToCSV, configs } = params;

    this.configs = {
      ...this.configs,
      ...configs,
      save: { ...this.configs.save, ...configs?.save },
    };

    this.setCSVDirPath(
      path.join(this!.configs!.save!.path!, this!.configs!.save!.dirName!)
    );

    this.setCSVFilePath(this!.configs!.save!.filename!);

    this.objectToCSV = Array.isArray(objectToCSV) ? objectToCSV : [objectToCSV];
  }

  /**
   * @Helper
   */

  private getCurrentMilliseconds(): string {
    return String(new Date().getTime());
  }

  /**
   * @Save
   */

  private saveCSVOnDisk(): void {
    this.createCSVDir();
    this.createCSVFile();
  }

  private createDir(initialDirLength = 0): void {
    const incrementDirLength = 1;
    const alreadyExists = fs.existsSync(this.CSVDirPath);

    if (!alreadyExists) fs.mkdirSync(this.CSVDirPath);
    else {
      const notConflictDirName = path.join(
        this!.configs!.save!.path!,
        `${initialDirLength}-${this!.configs!.save!.dirName!}`
      );

      this.setCSVDirPath(notConflictDirName);
      this.createDir(incrementDirLength + initialDirLength);
    }
  }

  private countCSVFilesIntoTheFolder(dirPath: string) {
    const length = fs
      .readdirSync(dirPath)
      .filter((content) => content.includes(".csv")).length;

    return length;
  }

  private createCSVDir(): void {
    for (let counter = 0; counter <= 1000; counter++) {
      const dirName = `${this!.configs!.save!.dirName!}`;
      const dirPath = path.join(this!.configs!.save!.path!, dirName);

      const dirCounterName = `${counter}-${this!.configs!.save!.dirName!}`;
      const dirCounterPath = path.join(
        this!.configs!.save!.path!,
        dirCounterName
      );

      const alreadyExistsCSVDir =
        counter >= 1
          ? fs.existsSync(dirPath) && fs.existsSync(dirCounterPath)
          : fs.existsSync(dirPath) || fs.existsSync(dirCounterPath);

      if (fs.existsSync(dirPath)) {
        this.setCSVDirPath(dirPath);

        const saveFilesOnSameDir =
          this.configs.save?.replace ||
          (!this.configs.save?.replace && !this.configs.save?.maxFiles);

        if (saveFilesOnSameDir) break;
      }

      if (fs.existsSync(dirCounterPath)) this.setCSVDirPath(dirCounterPath);

      if (!alreadyExistsCSVDir) {
        this.createDir();
        break;
      } else if (this.configs.save?.maxFiles) {
        const CSVfileQuantityIntoTheDir = this.countCSVFilesIntoTheFolder(
          this.CSVDirPath
        );

        const didYouReachTheLimit =
          CSVfileQuantityIntoTheDir === this.configs.save?.maxFiles;

        if (!didYouReachTheLimit) break;
      }
    }
  }

  private createCSVFile(): void {
    try {
      this.setContentInCSVFile();
    } catch (err) {
      throw new Error(`Error when trying to create/write the .csv file`);
    }
  }

  private setContentInCSVFile() {
    const alreadyExistCSVFile = fs.existsSync(this.CSVFilePath);

    if (alreadyExistCSVFile)
      if (!this.configs.save?.replace) {
        const fileQuantityIntoTheDir = this.countCSVFilesIntoTheFolder(
          this.CSVDirPath
        );
        const noConflictCSVFilePath = `${fileQuantityIntoTheDir}-${this.configs.save?.filename}`;

        this.setCSVFilePath(noConflictCSVFilePath);
      }

    fs.writeFile(this.CSVFilePath, this.CSVString, {}, (err: Error | null) => {
      if (err) console.error(`FileSystem Error: ${err}.`);
    });
  }

  private setCSVDirPath(path: string): void {
    this.CSVDirPath = path;
  }

  private setCSVFilePath(filename: string): void {
    this.CSVFilePath = `${this.CSVDirPath}/${filename}.csv`;
  }

  /**
   * @CSV
   */

  private setTableHeaders(data: ObjectToCSV): void {
    Object.keys(data).forEach(
      (header, index, tableHeadersArray) =>
        (this.CSVString += `${header}${this.configs.separator}${
          this.isLastArrayValue(index, tableHeadersArray) ? "\n" : ""
        }`)
    );
  }

  private setTableValues(data: ObjectToCSV): void {
    Object.values(data).forEach((value, index, tableValuesArray) => {
      const stringfiedValue = Array.isArray(value)
        ? value.join(",")
        : String(value);

      const valueContainsIsolatedCharacterOrIsArray =
        stringfiedValue.includes(this.configs.separator!) ||
        stringfiedValue.includes('"') ||
        Array.isArray(value);

      const protectedContent = valueContainsIsolatedCharacterOrIsArray
        ? this.protectContent(stringfiedValue)
        : stringfiedValue;

      const isLastArrayValue = this.isLastArrayValue(
        index,
        tableValuesArray as string[]
      );

      this.CSVString += `${protectedContent}${
        isLastArrayValue ? "" : this.configs.separator
      }${isLastArrayValue ? "\n" : ""}`;
    });
  }

  private protectContent(content: string): string {
    return `"${content}"`;
  }

  private isLastArrayValue(index: number, array: string[]): boolean {
    return index === array.length - 1;
  }

  /**
   * @validators
   */

  private validateEachPropertiesTypeValueOfObjectToCSV(value: any): void {
    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      !Array.isArray(value)
    )
      throw new Error(
        'The values ​​of the properties of the "object to CSV" can only be the string type, number or a array of them.'
      );
  }

  private validateEachPropertiesTypeValueOfValueOfObjectToCSV(
    value: any
  ): void {
    if (typeof value !== "string" && typeof value !== "number")
      throw new Error(
        'The values ​​of the properties of the "object to CSV" can only be the string type, number or a array of them.'
      );
  }

  private validateEachObjectToCSVValues(): void {
    if (Array.isArray(this.objectToCSV))
      this.objectToCSV.forEach((value) => {
        if (typeof value !== "object")
          throw new Error(
            '"Object to CSV" needs to be an array of objects or an object.'
          );

        Object.values(value).forEach((value) => {
          this.validateEachPropertiesTypeValueOfObjectToCSV(value);

          if (Array.isArray(value))
            value.forEach(
              this.validateEachPropertiesTypeValueOfValueOfObjectToCSV
            );
        });
      });
  }

  private validateEachObjectToCSVKeys(): void {
    if (Array.isArray(this.objectToCSV))
      this.objectToCSV.forEach((value) => {
        const valuesKeys = Object.keys(value);

        valuesKeys.forEach((key) => {
          if (typeof key !== "number" && typeof key !== "string")
            throw new Error(
              '"Object to CSV" keys can only be string or number type'
            );
        });
      });
  }

  private validateParameters(): void {
    if (typeof this.objectToCSV !== "object")
      throw new Error(
        '"Object to CSV" needs to be an array of objects or an object.'
      );

    const invalidDirCharactersRegex =
      /[\,|\.|\[|\]|\{|\}|\;|\=|\+|\)|\(|\*]/gim;
    if (
      this.configs.save &&
      this.configs.save?.dirName &&
      invalidDirCharactersRegex.test(this.configs.save.dirName)
    )
      throw new Error("Folder name is not valid!");

    if (this.configs.save?.maxFiles && this.configs.save?.maxFiles <= 0)
      throw new Error("Maximum file needs to be larger than zero.");

    if (typeof this.configs.separator !== "string")
      throw new Error(`Separator need be a string. (${acceptedSeparators})`);

    if (!acceptedSeparators.includes(this.configs.separator))
      throw new Error("Separator is not valid!");
  }
}

export default TranspilerToCSV;
