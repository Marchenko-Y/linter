const getBlockName = jsonAst => {
  const { children = [] } = jsonAst;
  let block;
  let index = 0;

  while (!block && index < children.length) {
    if (children[index].key.value === "block") {
      block = children[index].value.value;
    }
    index = index + 1;
  }

  return block;
};

module.exports = getBlockName;
