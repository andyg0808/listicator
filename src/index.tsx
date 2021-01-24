import React from "react";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import ParserViewer from "./ParserViewer";
import LexerViewer from "./LexerViewer";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./store";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#e50900",
    },
    secondary: {
      main: "#ffb700",
    },
  },
});

const parserViewer = false;
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {parserViewer && <ParserViewer />}
        <App />
        {parserViewer && <LexerViewer />}
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
/* reportWebVitals(); */
