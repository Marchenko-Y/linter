const walker = require("../../utils/walker");
const getBlockName = require("../../utils/getBlockName");
const sizes = require("../../constants/constants");

module.exports = {
  create(context) {
    const state = {};
    state.recheck = [];

    return {
      verify(node) {
        const children = node.children;
        const location = node.loc;
        const content = children.find(child => child.key.value === "content");

        let sizeStandard = undefined;
        let placeholder = undefined;

        function checkButtonSize(context, state, obj) {
          if (!sizeStandard) {
            state.recheck.push(() => {
              checkButtonSize(context, state, obj);
            });
            return;
          }

          const { children = [] } = obj;
          const mods = children.find(function(child) {
            return child.key.value === "mods";
          });
          let size =
            mods &&
            mods.value.children.find(function(child) {
              return child.key.value === "size";
            });
          size = size.value.value;

          if (!size) return;

          const index = sizes.indexOf(sizeStandard);
          if (index === -1 && index === sizes.length - 1) return;
          if (size !== sizes[index + 1]) {
            const { start, end } = obj.loc;
            const error = {
              code: "WARNING.INVALID_BUTTON_SIZE",
              error: `Размер кнопки блока warning должен быть на 1 шаг больше эталонного`,
              location: {
                start: { column: start.column, line: start.line },
                end: { column: end.column, line: end.line }
              }
            };
            context.reporter(error);
          }
        }

        function checkButtonPlace(obj, isRecheck) {
          if (!isRecheck) {
            state.recheck.push(() => {
              checkButtonPlace(obj, true);
            });
            return;
          }

          if (!placeholder) return;

          if (isRecheck) {
            const { start: btnStart, end: btnEnd } = obj.loc;
            const { start: phrStart } = placeholder.loc;

            if (
              btnEnd.line < phrStart.line ||
              (btnEnd.line === phrStart.line && btnEnd.column < phrStart.column)
            ) {
              const error = {
                code: "WARNING.INVALID_BUTTON_POSITION",
                error:
                  "Блок button в блоке warning не может находиться перед блоком placeholder на том же или более глубоком уровне вложенности.",
                location: {
                  start: { column: btnStart.column, line: btnStart.line },
                  end: { column: btnEnd.column, line: btnEnd.line }
                }
              };
              context.reporter(error);
            }
          }
        }

        function checkPlaceholderSize(obj) {
          const { children = [] } = obj;
          const validSizes = ["s", "m", "l"];

          const mods = children.find(function(child) {
            return child.key.value === "mods";
          });
          let size =
            mods &&
            mods.value.children.find(function(child) {
              return child.key.value === "size";
            });
          size = size && size.value.value;

          if (!size) return;

          if (!validSizes.includes(size)) {
            const { start, end } = obj.loc;
            const error = {
              code: "WARNING.INVALID_PLACEHOLDER_SIZE",
              error:
                " Допустимые размеры для блока placeholder в блоке warning (значение модификатора size): s, m, l.",
              location: {
                start: { column: start.column, line: start.line },
                end: { column: end.column, line: end.line }
              }
            };
            context.reporter(error);
          }
        }

        function checkSameTextSize(obj) {
          const { children = [] } = obj;
          const mods = children.find(function(child) {
            return child.key.value === "mods";
          });
          let size =
            mods &&
            mods.value.children.find(function(child) {
              return child.key.value === "size";
            });
          size = size.value.value;

          if (!size) return;
          if (!sizeStandard) {
            sizeStandard = size;
            return;
          }
          if (size !== sizeStandard) {
            const { start, end } = location;
            const error = {
              code: "WARNING.TEXT_SIZES_SHOULD_BE_EQUAL",
              error: "Тексты в блоке warning должны быть одного размера",
              location: {
                start: { column: start.column, line: start.line },
                end: { column: end.column, line: end.line }
              }
            };
            context.reporter(error);
          }
        }

        function resolver(obj) {
          const block = getBlockName(obj);
          switch (block) {
            case "text":
              checkSameTextSize(obj);
              break;
            case "button":
              checkButtonSize(context, state, obj);
              checkButtonPlace(obj, false);
              break;
            case "placeholder":
              placeholder = obj;
              checkPlaceholderSize(obj);
              break;
            default:
              break;
          }
        }

        if (content) {
          content.value.children.forEach(child => {
            walker(child, resolver);
          });
        }
      }
    };
  },
  meta: {
    type: "warning"
  }
};
