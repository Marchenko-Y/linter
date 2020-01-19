const getBlockName = require("./getBlockName");
const recognizer = rules => {
  return function(jsonAst) {
    const block = getBlockName(jsonAst);
    if (rules[block]) {
      rules[block].forEach(rule => rule.verify(jsonAst));
    }
  };
};

module.exports = recognizer;
