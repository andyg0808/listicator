import React from "react";
import { schema } from "prosemirror-schema-basic";
import { EditorState, PluginSpec, Plugin } from "prosemirror-state";
import { EditorView, DecorationSet, Decoration } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import "prosemirror-view/style/prosemirror.css";
import { errorParse } from "./parser";
import styled from "@emotion/styled";

const ProsemirrorContainer = styled.div`
  border: 1px solid black;
  .Prosemirror p {
    margin: 0px;
  }
`;

const plugin = new Plugin({
  props: {
    decorations(state: EditorState): DecorationSet | null {
      const text = plaintext(state.doc);
      const error = errorParse(text);
      if (!error) {
        return null;
      }
      console.log(error);
      const start = error.offset;
      const end = text.indexOf("\n", start);
      const decorations = [
        Decoration.inline(start, end, {
          style: "text-decoration: purple wavy underline",
        }),
      ];
      return DecorationSet.create(state.doc, decorations);
    },
  },
});

function plaintext(doc: Node): string {
  let output = "";
  doc.descendants((node: Node) => {
    if (node.type.isText) {
      output += node.text;
    }
    if (node.type.isBlock) {
      output += "\n";
    }
    return true;
  });
  return output.trimStart();
}

const keymapPlugin = keymap(baseKeymap);

function parseString(str: string): Node {
  return schema.node(
    "doc",
    null,
    str
      .split("\n")
      .map((s) => {
        if (s.length > 0) {
          return schema.node("paragraph", null, [schema.text(s)]);
        } else {
          return null;
        }
      })
      .filter((n) => n)
  );
}

interface RawProsemirrorProps {
  onChange: (s: string) => void;
  value: string;
  className?: string;
}

function RawProsemirror({ onChange, value, className }: RawProsemirrorProps) {
  const exportPlugin = new Plugin({
    view() {
      return {
        update(view: EditorView, prevState: EditorState) {
          onChange(plaintext(view.state.doc));
        },
      };
    },
  });
  const ref = React.useRef(null);
  const editorRef = React.useRef<EditorView>(null);
  React.useEffect(() => {
    const doc = value
      ? {
          doc: parseString(value),
        }
      : {};
    const state = EditorState.create({
      schema,
      ...doc,
      plugins: [keymapPlugin, plugin, exportPlugin],
    });
    editorRef.current = new EditorView(ref.current, { state });
  }, []);

  const clickHandler = () => editorRef.current?.focus();

  return (
    <ProsemirrorContainer
      onClick={clickHandler}
      className={className}
      ref={ref}
    />
  );
}

export const Prosemirror = React.memo(RawProsemirror);
