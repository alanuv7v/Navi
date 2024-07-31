// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.

if ("serviceworker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}

import van from "vanjs-core";

import * as userActions from "./userActions";
import init from "./init";
import CommandTree from "./prototypes/view/CommandTree";

//below is for debugging

import BrowserDB from "./interface/BrowserDb";
import DOM from "./DOM";
import appSession from "./appSession";
import * as BrowserSessions from "./interface/BrowserSessions";
import errorCatcher from "./utils/errorCatcher";
import Logger from "./prototypes/view/Logger";

window._debug = {
  DOM,
  userActions,
  appSession,
  BrowserDB,
  BrowserSessions,
  Logger,
};

//

const App = DOM;

const theme = "minimal";
if (theme) DOM.classList.add(`theme-${theme}`);

van.add(document.body, App);

let actionsOrder =
  "Root Edit Navigate Prune Visual Sessions Settings Fix Help".split(" ");
let userActionsSorted = Object.keys(userActions)
  .sort((k, kk) => {
    return actionsOrder.indexOf(k) - actionsOrder.indexOf(kk);
  })
  .map((key) => {
    return [key, userActions[key]];
  })
  .reduce((acc, cur) => {
    acc[cur[0]] = cur[1];
    return acc;
  }, {});

new CommandTree(userActionsSorted);

errorCatcher();

Logger.log("Hi, user.");

init();

export default App;
