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
import { SnackbarProvider } from "notistack";
import store from "./store";
import CssBaseline from "@material-ui/core/CssBaseline";

const headerFont = {
  fontFamily: ["Merriweather", "serif"].join(","),
};
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#e50900",
    },
    secondary: {
      main: "#ffb700",
    },
  },
  typography: {
    h1: {
      ...headerFont,
      fontSize: "2rem",
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: "0em",
    },
    h2: {
      ...headerFont,
      fontSize: "1.25rem",
      fontWeight: 400,
      lineHeight: 1.167,
      letterSpacing: "0em",
    },
    h3: headerFont,
    h4: headerFont,
    h5: headerFont,
    h6: headerFont,
  },
});

const parserViewer = false;
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={1}>
          {parserViewer && <ParserViewer />}
          <CssBaseline />
          <App />
          {parserViewer && <LexerViewer />}
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
/* reportWebVitals(); */
