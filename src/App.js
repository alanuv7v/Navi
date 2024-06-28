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

van.add(document.body, App)

new CommandsTree({...userActions})

errorCatcher()

Logger.log("Hi, user.")
console.log(Logger.logs)

init()


document.addEventListener("wheel", (event) => {
    
    if (!event.altKey) return false

    let targetNodeView = /* appSession.hoveredNode ||  */appSession.selectedNode
    if (!targetNodeView) return false

    let navigateSiblings = event.shiftKey
    
    event.preventDefault()


    
    console.log(event.altKey, event.shiftKey, targetNodeView.value)

        
    if (navigateSiblings) {
        
        let siblings = targetNodeView.originView.linkedNodeViews
        let thisIndex = siblings.indexOf(targetNodeView)
        
        console.log(siblings)

        if (event.deltaY > 0) {
            siblings[thisIndex + 1].select()
        } else {
            siblings[thisIndex - 1].select()
        }

        return true
    }

    if (event.deltaY > 0) {

        if (targetNodeView.opened) {
            targetNodeView.linkedNodeViews.at(0).select()
        } else {
            targetNodeView.open()
            targetNodeView.linkedNodeViews.at(0).select()
        }

    } else {

        if (targetNodeView.originView) {
            targetNodeView.originView.select()
        } else {
            targetNodeView.showOrigin()
        }

    }

}, {passive: false})

export default App