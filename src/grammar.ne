@preprocessor typescript

@{%
  const lexer = require("./lexer.js")
%}

@lexer lexer

main -> line:+
line -> 
    _:? ingredient {% i => i[1]%}
  | %heading {% i => null %}
ingredient -> 
    %ingredient {% i => [null, null, i[0].value] %}
  | mixed_number _:? (unit (_ %of):? _):? %ingredient {% i => [i[0] || null, i[2]?.[0] || null, i[3].value] %}
unit -> 
    %unit {% n => n[0].value %}
  | %forced_unit {% n => n[0].value %}
  | %ounces _ unit {% n => n[0].value + " " + n[2] %}
fraction -> 
    number %slash number  {% ([left, _, right]) => left/right %}
  | %fraction {% f => f[0].value %}
mixed_number -> 
    number (%dash|_):? fraction  {% ([number, _, fraction]) => number + fraction %}
  | fraction {% m => m[0] %}
  | number {% n => n[0] %}
  _ -> (%ws|%delimiter):+ {% data => null %}
number -> %number {% n => n[0].value %}

