import fc from "fast-check";


const seen = new Set();
const ingredient = fc
  .record({
    name: fc.string(),
  })
  .filter(({ name }) => {
    if (seen.has(name)) {
      return false;
    } else {
      seen.add(name);
      return true;
    }
  });

const amount = fc.record({
  quantity: fc.option(fc.nat()),
  unit: fc.option(fc.string()),
});

export const totalOrder = fc.record({
  ingredient: ingredient,
  amount: fc.array(amount),
});
