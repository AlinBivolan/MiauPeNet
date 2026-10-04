import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import AppInit from "./AppInit";
import "./styles/fonts.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AppInit>
    <App />
    </AppInit >
  </Provider>
);
