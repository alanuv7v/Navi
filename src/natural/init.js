import * as LocalDB from "../interface/SessionManager"
import appSession from "../resource/appSession"
import Session from "../entity/Session"

import deepEqual from "deep-equal"
import Query from "../entity/Query"

import * as UserActions  from "./UserActions"

async function alertSeedLocalDocumentChange() {
    try {
        let localDocumentTreeData = (await new Query(appSession.adress).parse()).treeData
        let seedDocumentChanged = deepEqual(appSession.tree.data, localDocumentTreeData) 
        if (!seedDocumentChanged) {
            console.log("!!! The seed document file has changed from the last session. Perhaps you want to regrow the tree.") 
            console.log("lastSession treeData: ", appSession.tree.data)
            console.log("document treeData: ", localDocumentTreeData)
        }
    } catch {
        
    }
}

export default async function init () {

    await import("../resource/BrowserDB")
    console.log("Imported local DB.")
    
    let lastSession = await LocalDB.getLastSession()
    if (lastSession) {
        appSession.copy(lastSession.data)
        console.log("Loaded last session data.")
        UserActions.Navigate.openTree("@root.yaml")
        alertSeedLocalDocumentChange()
    } else {
        console.log("Could not copy last session data. The last session data is corrupted or does not exist.")
        appSession.copy(new Session({}))
        await LocalDB.saveSession(appSession)
        console.log("Created new app session with empty data.")
    }

}