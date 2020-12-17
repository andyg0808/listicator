import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import ParserViewer from "./ParserViewer";
import reportWebVitals from "./reportWebVitals";
import { DragDropContext } from "react-beautiful-dnd";
import { Provider, useDispatch } from "react-redux";
import store, { reorder, ReorderEvent } from "./store";

function DragDispatcher({ children }) {
  const dispatch = useDispatch();

  function dragHandler(result, provided) {
    console.log(result, provided);
    const { source, destination } = result;
    dispatch(
      reorder({
        name: destination.droppableId,
        from: source.index,
        to: destination.index,
      })
    );
  }

  return <DragDropContext onDragEnd={dragHandler}>{children}</DragDropContext>;
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <DragDispatcher>
        <ParserViewer />
        <App />
      </DragDispatcher>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
/* reportWebVitals(); */
