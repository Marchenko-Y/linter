const rules = require(`./rules/index`);
const parse = require("json-to-ast");
const walker = require("./utils/walker");
const recognizer = require("./utils/recognizer");

class Linter {
  constructor(bemJsonString) {
    this.ast = parse(bemJsonString);
    this.errors = [];
    this.rules = {};
  }

  createRules() {
    const context = this.createRulesContext();
    for (let ruleKey in rules) {
      if (!this.rules[rules[ruleKey].meta.type]) {
        this.rules[rules[ruleKey].meta.type] = [];
      }
      this.rules[rules[ruleKey].meta.type].push(rules[ruleKey].create(context));
    }
  }
  createRulesContext() {
    return {
      reporter: this.reporter.bind(this),
      state: {}
    };
  }
  run() {
    this.createRules();
    walker(this.ast, recognizer(this.rules));
    return this.errors;
  }

  reporter(report) {
    this.errors.push(report);
  }
}

module.exports = function(jsonString) {
  const instance = new Linter(jsonString);
  return instance.run();
};
