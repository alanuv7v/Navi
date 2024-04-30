// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.

import van from "vanjs-core"

import * as UserActions from "./Natural/UserActions"
import init from "./Natural/init"
import ActionsIO from "./Workers/ActionsIO"
import * as CRUD from "./Natural/CRUD"

const App = DOM

van.add(document.body, App)

init()

export default App

//below is for debugging

new ActionsIO("UserActions", UserActions)
new ActionsIO("CRUD", CRUD)


import DB from "./Resources/DB"
import DOM from "./Resources/DOM"
import appSession from "./Resources/appSession"
import * as LocalDBManager from "./Directors/LocalDataManager"
window._debug = {
    DOM,
    UserActions,
    appSession,
    DB,
    LocalDBManager
}