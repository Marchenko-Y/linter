const recognizer = require("../utils/recognizer");

const walker = (jsonAst, recognizer) => {
  switch (jsonAst.type) {
    case "Object":
      const isBlock = jsonAst.children.reduce(function(acc, child) {
        return acc && child.key.value !== "elem";
      }, true);
      if (isBlock) {
        recognizer(jsonAst);
      }
      jsonAst.children.forEach(function(child) {
        walker(child, recognizer);
      });
      break;
    case "Property":
      if (jsonAst.key.value === "content" || jsonAst.key.value === "mix") {
        walker(jsonAst.value, recognizer);
      }
      break;
    case "Array":
      jsonAst.children.forEach(function(child) {
        walker(child, recognizer);
      });
      break;
    case "Identifier":
    case "Literal":
    default:
      break;
  }
};
module.exports = walker;
