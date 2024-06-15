// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.



//test

import * as LocalDB from "./interface/LocalDBManager"

window.LocalDB = await LocalDB.create()


//test end

import van from "vanjs-core"

import * as UserActions from "./natural/UserActions"
import init from "./natural/init"
import CommandsTree from "./entity/view/CommandTree"

//below is for debugging


import BrowserDB from "./resource/BrowserDB"
import DOM from "./resource/DOM"
import appSession from "./resource/appSession"
import * as SessionManager from "./interface/SessionManager"

window._debug = {
    DOM,
    UserActions,
    appSession,
    BrowserDB,
    SessionManager
}

//

const App = DOM

van.add(document.body, App)

new CommandsTree({UserActions})

await init()

export default App