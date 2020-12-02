import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { DragDropContext } from "react-beautiful-dnd";
import { Provider } from "react-redux";
import store from "./store";

function dragHandler(result, provided) {
  console.log(result, provided);
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <DragDropContext onDragEnd={dragHandler}>
        <App />
      </DragDropContext>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
/* reportWebVitals(); */
