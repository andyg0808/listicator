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
import { defined } from "./util";

const ProsemirrorContainer = styled.div`
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  & .ProseMirror {
    flex: 1;
    padding: 8px;
  }
  & .ProseMirror p {
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
    undefined,
    str
      .split("\n")
      .map((s) => {
        if (s.length > 0) {
          return schema.node("paragraph", undefined, [schema.text(s)]);
        } else {
          return null;
        }
      })
      .filter(defined)
  );
}

interface RawProsemirrorProps {
  onChange: (s: string) => void;
  value: string;
  className?: string;
}

function RawProsemirror({
  onChange,
  value,
  ...passthrough
}: Omit<
  React.ComponentPropsWithoutRef<typeof ProsemirrorContainer>,
  "onChange"
> &
  RawProsemirrorProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const exportPlugin = new Plugin({
      view() {
        return {
          update(view: EditorView, prevState: EditorState) {
            onChange(plaintext(view.state.doc));
          },
        };
      },
    });
    if (ref.current === null) {
      return;
    }
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
    // We only need to start the EditorView; outputting the results
    // happens via plugin.
    const view = new EditorView(ref.current, { state });
    return () => {
      view.destroy();
    };
  }, [value]);

  return <ProsemirrorContainer data-test="Editor" ref={ref} {...passthrough} />;
}

export const Prosemirror = React.memo(RawProsemirror);
