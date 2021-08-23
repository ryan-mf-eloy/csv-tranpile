import path from "path";
import Transpiler from "../lib";

const transpiler = new Transpiler();

const CSVPathOrString = path.join(__dirname, "../", "lib/scripts/peoples.csv");

const CSVObject = transpiler.toObject(CSVPathOrString, ["hobbies"]);

console.log(CSVObject);
