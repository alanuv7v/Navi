// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.

import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import * as UserActions from "./UserActions"
import init from "./init"
import DOM from "./Resources/DOM"
import Logger from "./Workers/Logger"

const App = DOM

console.log(UserActions)

van.add(document.body, App)

init()

export default App

console.log(DOM)
new Logger(UserActions)

import refs from "./Resources/DOMRefs"
refs("States").append(
    div("Selected node: ")
)