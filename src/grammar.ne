@builtin "number.ne"
@preprocessor typescript

@{%
  const lexer = require("./lexer.js")
%}

@lexer lexer

main -> line:+
line -> 
    ingredient {% i => i[0]%}
  | %heading {% i => null %}
ingredient -> _:? (mixed_number _ (%unit _):?):? %ingredient
fraction -> 
    number "/" number  {% ([left, _, right]) => left/right %}
  | %fraction {% f => f.value %}
mixed_number -> 
    number (%dash|_):? fraction  {% ([number, _, fraction]) => number + fraction %}
  | fraction {% m => m[0] %}
  | number {% n => n[0] %}
_ -> %ws {% data => null %}
number -> %number {% n => n[0].value %}

