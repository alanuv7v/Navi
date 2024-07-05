// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.


if ('serviceworker' in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
}


import van from "vanjs-core"

import * as userActions from "./natural/userActions"
import init from "./natural/init"
import CommandsTree from "./entity/view/CommandTree"

//below is for debugging


import BrowserDB from "./resource/BrowserDB"
import DOM from "./resource/DOM"
import appSession from "./resource/appSession"
import * as SessionManager from "./interface/SessionManager"
import errorCatcher from "./tech/errorCatcher"
import Logger from "./tech/gui/Logger"

window._debug = {
    DOM,
    userActions,
    appSession,
    BrowserDB,
    SessionManager,
    Logger
}

//

const App = DOM

const theme = "minimal"
if (theme) DOM.classList.add(`theme-${theme}`)

van.add(document.body, App)

let actionsOrder = "Root Edit Navigate Prune Visual Sessions Settings fix".split(" ")
let userActionsSorted = Object.keys(userActions)
    .sort((k, kk) => {
        return (actionsOrder.indexOf(k) - actionsOrder.indexOf(kk))
    })
    .map(key => {
        return [key, userActions[key]]
    })
    .reduce((acc, cur) => {
        acc[cur[0]] = cur[1]
        return acc
    }, {})

console.log(actionsOrder, userActionsSorted)

new CommandsTree(userActionsSorted)

errorCatcher()

Logger.log("Hi, user.")
console.log(Logger.logs)

init()


export default App