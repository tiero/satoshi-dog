import React, {useEffect} from "react";
import ReactDOM from "react-dom";

import Race from "./components/Race";

const App = () => (
  <>
    <Race />
  </>
);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);