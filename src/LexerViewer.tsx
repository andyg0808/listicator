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
import { Token } from "moo";

import * as R from "ramda";

const Blob = styled.pre``;
export default function LexerViewer() {
  const [text, setText] = React.useState("");
  lexer.reset(text);
  const tokens: Token[] = [];
  let error: Token | null = null;
  try {
    for (const token of lexer) {
      tokens.push(token);
    }
  } catch (e) {
    console.log(e);
    error = e;
  }

  const lastTok = R.last(tokens);
  const errTok = lastTok?.type === "lexError" ? lastTok : null;

  return (
    <Container>
      <TextareaAutosize
        // @ts-ignore
        onChange={(e: any) => setText(e.target.value)}
        onBlur={(e: any) => setText(e.target.value)}
        value={text}
      />
      {tokens.map((t) => (
        <Blob>{JSON.stringify(t)}</Blob>
      ))}
      <Blob>{JSON.stringify(error)}</Blob>
      {errTok && <DisplayError error={errTok} text={text} />}
    </Container>
  );
}

interface DisplayErrorProps {
  error: Token;
  text: string;
}

function DisplayError({ error, text }: DisplayErrorProps) {
  const [left, right] = R.splitAt(error.offset, text);
  return (
    <>
      <h2>Error</h2>
      <Blob style={{ color: "green" }}>{left}</Blob>
      <Blob style={{ color: "red" }}>{right}</Blob>
    </>
  );
}
