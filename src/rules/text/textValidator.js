function checkNumberOfH1(context, state, location) {
  if (state.h1) {
    const { start, end } = location;
    const error = {
      code: "TEXT.SEVERAL_H1",
      error: "Заголовок h1 должен быть единственным на странице",
      location: {
        start: { column: start.column, line: start.line },
        end: { column: end.column, line: end.line }
      }
    };

    context.reporter(error);
  }
}
function checkPositionOfH2(context, state, location, obj, isRecheck) {
  if (!isRecheck) {
    state.recheck.push(() => {
      checkPositionOfH2(context, state, location, obj, true);
    });
  }

  if (!state.h1) return;

  if (isRecheck) {
    const { start: h1Start } = state.h1.loc;
    const { start: h2Start, end: h2End } = location;

    if (
      h2End.line < h1Start.line ||
      (h2End.line === h1Start.line && h2End.column < h1Start.column)
    ) {
      const error = {
        code: "TEXT.INVALID_H2_POSITION",
        error:
          "Заголовок h2 не может находиться перед заголовком первого уровня на том же или более глубоком уровне вложенности",
        location: {
          start: { column: h2Start.column, line: h2Start.line },
          end: { column: h2End.column, line: h2End.line }
        }
      };

      context.reporter(error);
    }
  }
}

function checkPositionOfH3(context, state, location, obj, isRecheck) {
  if (!isRecheck) {
    state.recheck.push(() => {
      checkPositionOfH3(context, state, location, obj, true);
    });
    return;
  }

  if (!state.h2) return;

  if (isRecheck) {
    const { start: h2Start } = state.h2.loc;
    const { start: h3Start, end: h3End } = location;

    if (
      h3End.line < h2Start.line ||
      (h3End.line === h2Start.line && h3End.column < h2Start.column)
    ) {
      const error = {
        code: "TEXT.INVALID_H3_POSITION",
        error:
          "Заголовок h3 не может находиться перед заголовком второго уровня на том же или более глубоком уровне вложенности",
        location: {
          start: { column: h3Start.column, line: h3Start.line },
          end: { column: h3End.column, line: h3End.line }
        }
      };
      context.reporter(error);
    }
  }
}

module.exports = {
  create(context) {
    const state = {};
    state.recheck = [];
    return {
      verify(node) {
        const children = node.children;
        const location = node.loc;
        const mods = children.find(child => child.key.value === "mods");

        function recognizer(obj) {
          const mod = obj.key.value;
          switch (mod) {
            case "type":
              const type = obj.value.value;
              switch (type) {
                case "h1":
                  checkNumberOfH1(context, state, location);
                  state.h1 = obj;
                  break;
                case "h2":
                  checkPositionOfH2(context, state, location, obj, false);
                  state.h2 = obj;
                  break;
                case "h3":
                  checkPositionOfH3(context, state, location, obj, false);
                  break;
                default:
                  break;
              }
              break;
            default:
              break;
          }
        }

        if (mods) {
          mods.value.children.forEach(mod => {
            recognizer(mod);
          });
        }
        state.recheck.forEach(function(func) {
          func();
        });
      }
    };
  },
  meta: {
    type: "text"
  }
};
