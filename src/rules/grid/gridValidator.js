const getBlockName = require("../../utils/getBlockName");
module.exports = {
  create(context) {
    const state = {
      recheck: []
    };
    return {
      verify(node) {
        const children = node.children;
        const location = node.loc;

        const { content, mods } = children.reduce(
          (acc, child) => {
            if (child.key.value === "content") acc.content = child;
            if (child.key.value === "mods") acc.mods = child;
            return acc;
          },
          { content: "", mods: "" }
        );

        const colNumFind = mods.value.children.find(
          child => child.key.value === "m-columns"
        );
        const colNum = colNumFind && colNumFind.value.value;

        let marketingColNum = 0;

        if (content) {
          content.value.children.forEach(function(child) {
            recognizer(child);
          });
        }
        if (marketingColNum) {
          state.recheck.push(() => {
            spotPartOfMarketingBlocks(null, true);
          });
        }

        function recognizer(obj) {
          const { mCol, block } = obj.children.reduce(
            (acc, child) => {
              if (child.key.value === "elemMods") {
                const mods = child.value.children;
                const mColMod = mods.find(mod => mod.key.value === "m-col");
                acc.mCol = mColMod && mColMod.value.value;
              }
              if (child.key.value === "content") {
                acc.block = child.value.children[0];
              }
              return acc;
            },
            { mCol: undefined, block: undefined }
          );

          const blockName =
            block.type === "Object" ? getBlockName(block) : block.value.value;
          switch (blockName) {
            case "commercial":
            case "offer":
              spotPartOfMarketingBlocks(mCol, false);
              break;
            default:
              break;
          }
        }

        function spotPartOfMarketingBlocks(mCol, isRecheck) {
          if (!isRecheck) {
            if (!mCol) return;
            marketingColNum += parseInt(mCol);
            return;
          }

          if (!colNum) return;

          if (isRecheck) {
            const colNumNumber = parseInt(colNum);
            const allowedColNum =
              colNumNumber % 2 === 0
                ? colNumNumber / 2
                : (colNumNumber - 1) / 2;

            if (marketingColNum > allowedColNum) {
              const { start, end } = location;
              const error = {
                code: "GRID.TOO_MUCH_MARKETING_BLOCKS",
                error:
                  "Маркетинговые блоки(commercial, offer) должны занимать не больше половины от всех колонок блока grid",
                location: {
                  start: { column: start.column, line: start.line },
                  end: { column: end.column, line: end.line }
                }
              };
              context.reporter(error);
            }
          }
        }

        state.recheck.forEach(func => {
          func();
        });
      }
    };
  },
  meta: {
    type: "grid"
  }
};
