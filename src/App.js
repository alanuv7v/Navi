// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.

import van from "vanjs-core"

import * as UserActions from "./UserActions"
import init from "./init"
import Logger from "./Workers/Logger"

const App = DOM

van.add(document.body, App)

init()

export default App

//below is for debugging

new Logger(UserActions)


import DB from "./Resources/DB"
import DOM from "./Resources/DOM"
import appSession from "./appSession"

window._debug = {
    DOM,
    UserActions,
    appSession,
    DB
}
