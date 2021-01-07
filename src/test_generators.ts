import fc from "fast-check";

function sortDisplayOrder(sortOrder: StoreOrderMap, displayOrder: string[]) {
  const [positioned, remaining] = R.partition(
    (i) => R.has(i, sortOrder),
    displayOrder
  );

  remaining.sort();
  positioned.sort();

  return mergeDisplayOrder(0, positioned, remaining, sortOrder);
}

function mergeDisplayOrder(
  idx: number,
  positioned: string[],
  remaining: string[],
  storeOrder: StoreOrderMap
): string[] {
  if (positioned.length == 0) {
    return remaining;
  } else if (remaining.length == 0) {
    return positioned;
  }

  const name = positioned[0];
  const position = storeOrder[name];

  if (idx == position) {
    return R.prepend(
      positioned[0],
      merge(idx + 1, positioned.slice(1), remaining, storeOrder)
    );
  } else {
    return R.prepend(
      remaining[0],
      merge(idx + 1, positioned, remaining.slice(1), storeOrder)
    );
  }
}

function generatePositionInformation({
  fromIdx,
  toIdx,
  displayed,
  mappedIndexes,
}) {
  const mapping = Object.fromEntries(
    R.zipWith((name, idx) => [name, idx], displayed, mappedIndexes)
  );

  const displayOrder = sortDisplayOrder(mapping, displayed);

  const name = displayed[fromIdx];
  const event: ReorderEvent = {
    name,
    store: "n/a",
    fromIdx: fromIdx,
    toIdx: toIdx,
    displayOrder: displayed,
  };
  return [mapping, event];
}

const fc_displayed = fc.set(fc.string(), { minLength: 1 });
const fc_state = fc_displayed
  .chain((displayed) =>
    fc.record({
      fromIdx: fc.nat(displayed.length - 1),
      toIdx: fc.nat(displayed.length - 1),
      displayed: fc.constant(displayed),
      mappedIndexes: fc.set(fc.nat(), { maxLength: displayed.length }),
    })
  )
  .map(generatePositionInformation);

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
