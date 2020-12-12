import pytest
import re
from parser import Order, parse
from pathlib import Path
from random import shuffle

examples = Path("examples")
expected = Path("expected")
def example_files():
    return list(examples.iterdir())

print(example_files())

@pytest.fixture(params=example_files())
def example_file(request):
    return request.param


def test_parser(example_file):
    print(example_file)
    expected_file = expected / f"{example_file.name}-expected"
    with example_file.open() as fi:
        parsed = parse(fi.read())
    with expected_file.open() as fi:
        expected_str = fi.read()
        expected_ingredients = list(filter(None, (extract_description(line) for line in expected_str.split("\n"))))
    assert expected_ingredients == parsed


def extract_description(line):
    parts = line.split("|")
    if len(parts) < 3:
        return None
    amount, unit, ingredient = parts
    if amount == "":
        amount = None
    elif m := re.search(r"([\d/ ]+) (?:to|-) ([\d/ ]+)", amount):
        amount = (float(m[1]), float(m[2]))
    else:
        amount = float(amount)
    if unit == "":
        unit = None
    return Order(amount, unit, ingredient)
