import React from "react";
import Table from "@material-ui/core/Table";
import Container from "@material-ui/core/Container";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

import styled from "@emotion/styled";

import { lexer } from "./lexer";

const Blob = styled.pre``;
export default function LexerViewer() {
  const [text, setText] = React.useState("");
  lexer.reset(text);
  const tokens: any[] = [];
  let error: any = null;
  try {
    for (const token of lexer) {
      tokens.push(token);
    }
  } catch (e) {
    console.log(e);
    error = e;
  }
  return (
    <Container>
      <TextareaAutosize
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => setText(e.target.value)}
        value={text}
      />
      {tokens.map((t) => (
        <Blob>{JSON.stringify(t)}</Blob>
      ))}
      <Blob>{JSON.stringify(error)}</Blob>
    </Container>
  );
}
