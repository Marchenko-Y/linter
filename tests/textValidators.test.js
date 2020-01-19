const linter = require("../src/linter");

describe("Tests on number of headers h1", () => {
  test("The number of heading h1 is one", () => {
    const json = `[
      {
          "block": "text",
          "mods": { "type": "h1" }
      }
  ]`;

    expect(linter(json)).toEqual([]);
  });

  test("The number of heading h1 large then 1", () => {
    const json = `{
      "block": "page",
      "content": [
        { "block": "text", "mods": { "type": "h1" } },
        { "block": "text", "mods": { "type": "h1" } }
      ]
    }`;

    expect(linter(json)).toEqual([
      {
        code: "TEXT.SEVERAL_H1",
        error: "Заголовок h1 должен быть единственным на странице",
        location: {
          start: { column: 9, line: 5 },
          end: { column: 54, line: 5 }
        }
      }
    ]);
  });
});

describe("test on finding a position h2", () => {
  test("Header h2 is not before h1", () => {
    const json = `[
      {
          "block": "text",
          "mods": { "type": "h1" }
      },
      {
          "block": "text",
          "mods": { "type": "h2" }
      }
  ]`;

    expect(linter(json)).toEqual([]);
  });

  test("Header h2 before h1", () => {
    const json = `[
      {
          "block": "text",
          "mods": { "type": "h2" }
      },
      {
          "block": "text",
          "mods": { "type": "h1" }
      }
  ]`;
    expect(linter(json)).toEqual([
      {
        code: "TEXT.INVALID_H2_POSITION",
        error:
          "Заголовок h2 не может находиться перед заголовком первого уровня на том же или более глубоком уровне вложенности",
        location: {
          start: { column: 7, line: 2 },
          end: { column: 8, line: 5 }
        }
      }
    ]);
  });
});

describe("test on finding a position h3", () => {
  test("Header h3 is not before h2", () => {
    const json = `[
      {
          "block": "text",
          "mods": { "type": "h2" }
      },
      {
          "block": "text",
          "mods": { "type": "h3" }
      }
  ]`;

    expect(linter(json)).toEqual([]);
  });

  test("Header h3 before h2", () => {
    const json = `[
      {
          "block": "text",
          "mods": { "type": "h3" }
      },
      {
          "block": "text",
          "mods": { "type": "h2" }
      }
  ]`;

    expect(linter(json)).toEqual([
      {
        code: "TEXT.INVALID_H3_POSITION",
        error:
          "Заголовок h3 не может находиться перед заголовком второго уровня на том же или более глубоком уровне вложенности",
        location: {
          start: { column: 7, line: 2 },
          end: { column: 8, line: 5 }
        }
      }
    ]);
  });
});
