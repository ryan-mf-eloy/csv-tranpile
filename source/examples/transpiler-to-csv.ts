import Transpiler from "../lib";

const transpiler = new Transpiler();

const objectToCSV = [
  {
    name: "John Miller",
    age: 35,
    gender: "Male",
    hobbies: ["Watch", "Eat", "Develop node apps"],
  },
  {
    name: "Ryan Eloy",
    age: 19,
    gender: "Male",
    hobbies: ["Bodybuilding", "Learn Javascript/NodeJS"],
  },
];

const CSVString = transpiler.toCSV({
  objectToCSV,
  configs: {
    separator: "=",
    save: {
      filename: "peoples",
      dirName: "csv-files",
      replace: true,
    },
  },
});

console.log(CSVString);
