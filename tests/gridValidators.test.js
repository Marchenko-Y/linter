const linter = require("../src/linter");

describe("Check grid rule", () => {
  test("Marketing blocks less than a half of grid columns", () => {
    const json = `{
      "block": "grid",
      "mods": {
          "m-columns": "10"
      },
      "content": [
          {
              "block": "grid",
              "elem": "fraction",
              "elemMods": {
                  "m-col": "8"
              },
              "content": [
                  {
                      "block": "payment"
                  }
              ]
          },
          {
              "block": "grid",
              "elem": "fraction",
              "elemMods": {
                  "m-col": "2"
              },
              "content": [
                  {
                      "block": "offer"
                  }
              ]
          }
      ]
   }`;

    expect(linter(json)).toEqual([]);
  });

  test("Text sizes is not equal", () => {
    const json = `{
      "block": "grid",
      "mods": {
          "m-columns": "10"
      },
      "content": [
          {
              "block": "grid",
              "elem": "fraction",
              "elemMods": {
                  "m-col": "2"
              },
              "content": [
                  {
                      "block": "payment"
                  }
              ]
          },
          {
              "block": "grid",
              "elem": "fraction",
              "elemMods": {
                  "m-col": "8"
              },
              "content": [
                  {
                      "block": "offer"
                  }
              ]
          }
      ]
   }`;

    expect(linter(json)).toEqual([
      {
        code: "GRID.TOO_MUCH_MARKETING_BLOCKS",
        error:
          "Маркетинговые блоки(commercial, offer) должны занимать не больше половины от всех колонок блока grid",
        location: {
          start: { column: 1, line: 1 },
          end: { column: 5, line: 32 }
        }
      }
    ]);
  });
});
