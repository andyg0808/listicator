@preprocessor typescript

@{%
  const {lexer} = require("./lexer")
  const Fraction = require("fraction.js")
%}

@lexer lexer

main -> line:+
line ->
    _:? ingredient {% i => i[1]%}
  | %dash _ ingredient {% i => i[2]%}
  | %heading {% i => null %}
ingredient ->
    %ingredient {% i => [null, null, i[0].value] %}
  | mixed_number _:? %ingredient {% i => [i[0] || null, null, i[2].value] %}
  | %size _ unit %ingredient {% i => [new Fraction(1), i[0].value + " " + i[2], i[3].value] %}
  | unit _:? %ingredient {% i => [new Fraction(1), i[0], i[2].value] %}
  | mixed_number _:? unit (_ %of):? _:? %ingredient {% i => [i[0] || null, i[2] || null, i[5].value] %}
unit ->
    %unit {% n => n[0].value %}
  | %forced_unit {% n => n[0].value %}
  | %size _ unit {% n => n[0].value + " " + n[2] %}
  | %size {% n => n[0].value %}
fraction ->
    number %slash number  {% ([left, _, right]) => new Fraction(left, right) %}
  | %fraction {% f => f[0].value %}
mixed_number ->
    number (%dash|_):? fraction  {% ([number, _, fraction]) => number.add(fraction) %}
  | fraction {% m => m[0] %}
  | number {% n => n[0] %}
_ -> (%ws|%delimiter):+ {% data => null %}
number -> %number {% n => n[0].value %}
