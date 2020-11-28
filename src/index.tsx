import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { DragDropContext } from "react-beautiful-dnd";

function dragHandler(result, provided) {
  console.log(result, provided);
}

ReactDOM.render(
  <React.StrictMode>
    <DragDropContext onDragEnd={dragHandler}>
      <App />
    </DragDropContext>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
/* reportWebVitals(); */
