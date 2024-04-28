import * as TreeManager from "./Directors/TreeManager"
import * as LocalDBManager from "./Directors/LocalDBManager"
import appSession from "./appSession"


export default function init () {
    import("./Resources/DB")
        .then(async (DB) => {
            try {
                const lastSession = await LocalDBManager.getLastSession()
                for (let e of Object.entries(lastSession.data)) {
                    appSession[e[0]] = e[1]
                }
                console.log("loaded last session data.", lastSession.data)
            }
            catch {
                console.log("Could not create app session from last session data. The last session data is corrupted or does not exist.")
                let cleanSession = await LocalDBManager.createSession()

                for (let e of Object.entries(cleanSession)) {
                    appSession[e[0]] = e[1]
                    console.log(e)
                }
                console.log(appSession, cleanSession)
                
                console.log("Created new app session with empty data.")
            }
            finally {
                appSession.autosave = true
                TreeManager.openTree(appSession.tree.data)
            }
        })
}