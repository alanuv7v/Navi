// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.



//test

import * as LocalDB from "./interface/LocalDBManager"

window.LocalDB = LocalDB


//test end






import van from "vanjs-core"

import * as UserActions from "./natural/UserActions"
import init from "./natural/init"
import CommandsIO from "./tech/CommandsIO"

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

new CommandsIO("UserActions", UserActions)
new CommandsIO("Context", {})

await init()

export default App

import * as yaml from "yaml"
console.log(yaml.stringify({
    "8fsa": 0,
    "2asfd": 0,
    "1fasf": 0,
    "3saf": 0,
    3: 0,
    2: 0,
    1: 0

}))
