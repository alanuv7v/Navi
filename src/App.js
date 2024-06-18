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

window._debug = {
    DOM,
    userActions,
    appSession,
    BrowserDB,
    SessionManager
}

//

const App = DOM

van.add(document.body, App)

new CommandsTree({...userActions})

init()

export default App