type unit_measure = string;
type initialValue = {from: string, to: string, from_unit: unit_measure, to_unit: unit_measure}

@genType
type stored_fraction = {n: int, d: int}

@genType
type density = {
  from: unit_measure,
  to: unit_measure,
  value: stored_fraction,
  ingredient: string
}

@genType
type conversion = {
  from: unit_measure,
  to: unit_measure,
  value: stored_fraction
}

@genType
let initialValueFromCurrent = (density: option<density>, quantity: float, source: unit_measure, target: unit_measure) =>
    switch density {
        | None => {
          from: Belt.Float.toString(quantity),
            to: "",
          from_unit: source,
          to_unit: target
        }
        | Some(density) => {
          from: Belt.Int.toString(density.value.d),
            to: Belt.Int.toString(density.value.n),
          from_unit: density.from,
          to_unit: density.to,
        }
    }
