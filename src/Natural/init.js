import * as TreeManager from "../Directors/TreeManager"
import * as LocalDBManager from "../Directors/LocalDataManager"
import * as ImportManager from "../Directors/ImportManager"
import * as Garner from "../Workers/Garner"
import appSession from "../Resources/appSession"

import deepEqual from "deep-equal"


export default function init () {

    function copySessionData(target, source) {
        for (let e of Object.entries(source)) {
            if (e[0]==="autosave") continue
            target[e[0]] = e[1]
        }
    }

    async function loadLastSession() {
        const lastSession = await LocalDBManager.getLastSession()
        copySessionData(appSession, lastSession.data)
        console.log("loaded last session data.")
    }

    async function createCleanSession() {
        console.log("Could not create app session from last session data. The last session data is corrupted or does not exist.")
        let cleanSession = await LocalDBManager.createSession()
        copySessionData(appSession, cleanSession)
        console.log("Created new app session with empty data.")
    }

    import("../Resources/DB")
        .then(async (DB) => {
            try {
                await loadLastSession()
            }
            catch {
                await createCleanSession()
            }
        }).then(async () => {
            try {
                let documentTreeData = await ImportManager.getTreeDataFromQuery(appSession.tree.seed)
                let seedDocumentChanged = deepEqual(appSession.tree.data, documentTreeData) 
                if (!seedDocumentChanged) {
                    console.log("!!! The seed document file has changed from the last session. Perhaps you want to regrow the tree.") 
                    console.log("lastSession treeData: ", appSession.tree.data)
                    console.log("document treeData: ", documentTreeData)
                }
            } 
            finally {
                appSession.autosave = true
                Garner.plantSeedNode(appSession.tree.seedNode)
            }

        })
}