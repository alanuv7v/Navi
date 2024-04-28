import * as TreeManager from "./Directors/TreeManager"
import * as LocalDBManager from "./Directors/LocalDBManager"
import appSession from "./appSession"

function copySessionData(target, source) {
    for (let e of Object.entries(source)) {
        if (e[0]==="autosave") continue
        target[e[0]] = e[1]
    }
}


export default function init () {
    import("./Resources/DB")
        .then(async (DB) => {
            try {
                const lastSession = await LocalDBManager.getLastSession()
                copySessionData(appSession, lastSession.data)
                console.log(appSession, lastSession.data)
                console.log("loaded last session data.")
            }
            catch {
                console.log("Could not create app session from last session data. The last session data is corrupted or does not exist.")
                let cleanSession = await LocalDBManager.createSession()

                copySessionData(appSession, cleanSession)
                
                console.log("Created new app session with empty data.")
            }
            finally {
                appSession.autosave = true
                TreeManager.openTree("tree", appSession.tree.data)
            }
        })
}