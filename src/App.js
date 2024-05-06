// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.

import van from "vanjs-core"

import * as UserActions from "./Natural/UserActions"
import init from "./Natural/init"
import CommandsIO from "./Workers/CommandsIO"

//below is for debugging


import DB from "./Resources/DB"
import DOM from "./Resources/DOM"
import appSession from "./Resources/appSession"
import * as LocalDB from "./Directors/LocalDB"

window._debug = {
    DOM,
    UserActions,
    appSession,
    DB,
    LocalDB
}

//

const App = DOM

van.add(document.body, App)

new CommandsIO("UserActions", UserActions)

await init()

export default App
