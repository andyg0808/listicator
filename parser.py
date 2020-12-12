import fractions
import re
from dataclasses import dataclass


@dataclass
class Order:
    number: int = None
    unit: str = None
    ingredient: str = None

UNIT_LOOKUP = {
    r"c\.|cups?": "cup",
    r"tablespoons?|tbsp\.": "tablespoon",
    r"teaspoons?|tsp\.": "teaspoon",
    r"ounces?": "ounce",
}

FRACTIONS = {
    "¼": "1/4",
    "½": "1/2",
}

def unit_parse(data):
    for regex, target in UNIT_LOOKUP.items():
        if m := re.match(regex, data, re.IGNORECASE):
            print("unit match", m)
            return target, data[m.end():]
    return None

def parse(data):
    numbers = "".join(FRACTIONS.keys())
    NUMBER = r"\d*\s*[{}]|\d+[\d /-]*".format(numbers)
    INGREDIENT = re.compile(r"[^\d\n/]+")

    ingredients = []
    current = Order()
    while len(data) > 0:
        print(data[0:20])
        if m := re.match(NUMBER, data):
            text = m[0]
            data = data[m.end() :]
            print('found number', text)
            if strip := re.match(r"\s*to (" + NUMBER + r")", data):
                data = data[strip.end() :]
                text = strip[1]
                print("RANGE UPPER", text)
            text = text.strip().replace("-", " ")
            for (vulgar, string) in FRACTIONS.items():
                text = text.replace(vulgar, string)
            chunks = text.split()
            print(chunks)
            current.number = float(sum(fractions.Fraction(c) for c in chunks))
            print("number is", current.number)
        elif m := unit_parse(data):
            print('found unit', m[0])
            current.unit, data = m
        elif m := INGREDIENT.match(data):
            print('found ingredient', m[0])
            current.ingredient = m[0].strip()
            data = data[m.end() :]
        if current.ingredient:
            print("got", current)
            ingredients.append(current)
            current = Order()
            data = data.lstrip("\n")
            if m := re.match(r"[a-zA-Z ]+:", data):
                data = data[m.end() :]
        data = data.lstrip()
    return ingredients


if __name__ == "__main__":
    with open("example") as fi:
        data = fi.read()
    ingredients = parse(data)
    for ingredient in ingredients:
        print(
            "{} {} {}".format(
                ingredient.get("number"),
                ingredient.get("unit"),
                ingredient.get("ingredient"),
            )
        )
