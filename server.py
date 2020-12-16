#!/usr/bin/env python3

from flask import Flask, request
from flask_cors import CORS
from pathlib import Path
import tempfile
import json

app = Flask(__name__)
CORS(app)

@app.route("/example", methods=['PUT'])
def example():
    print(request.data)
    body = request.get_json()
    print(body)
    if not body['url']:
        return ("Missing url", 400)
    fh, name = tempfile.mkstemp(dir="./examples", text=True)
    print(name)
    name = Path(name)
    with open(fh, "w") as fi:
        fi.write(body['example'])
    expected = Path("./expected")
    with open(expected/(name.name + "-expected"), "w") as fi:
        fi.write(body['expected'])
    urls = Path("./urls")
    with open(urls/(name.name), "w") as fi:
        fi.write(body['url'])
    return ("", 201)
