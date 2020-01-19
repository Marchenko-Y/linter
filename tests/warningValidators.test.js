const linter = require("../src/linter");

describe("Check text size on warning block", () => {
  test("Text sizes is equal", () => {
    const json = `{
      "block": "warning",
      "content": [
          { "block": "text", "mods": { "size": "l" } },
          { "block": "text", "mods": { "size": "l" } }
      ]
      
  }`;

    expect(linter(json)).toEqual([]);
  });

  test("Text sizes is not equal", () => {
    const json = `{
      "block": "warning",
      "content": [
          { "block": "text", "mods": { "size": "l" } },
          { "block": "text", "mods": { "size": "m" } }
      ]
  }`;

    expect(linter(json)).toEqual([
      {
        code: "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL",
        error: "Тексты в блоке warning должны быть одного размера",
        location: {
          start: { column: 1, line: 1 },
          end: { column: 4, line: 7 }
        }
      }
    ]);
  });
});
