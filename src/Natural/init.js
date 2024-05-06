import * as LocalDB from "../Directors/LocalDB"
import appSession from "../Resources/appSession"
import Session from "../Entities/Session"

import deepEqual from "deep-equal"
import Query from "../Entities/Query"

import * as UserActions  from "./UserActions"

async function alertSeedLocalDocumentChange() {
    let localDocumentTreeData = await new Query(appSession.adress).treeData()
    let seedDocumentChanged = deepEqual(appSession.tree.data, localDocumentTreeData) 
    if (!seedDocumentChanged) {
        console.log("!!! The seed document file has changed from the last session. Perhaps you want to regrow the tree.") 
        console.log("lastSession treeData: ", appSession.tree.data)
        console.log("document treeData: ", localDocumentTreeData)
    }
}

export default async function init () {

    await import("../Resources/DB")
    console.log("Imported local DB.")
    
    let lastSession = await LocalDB.getLastSession()
    if (lastSession) {
        appSession.copy(lastSession.data)
        console.log("Loaded last session data.")
        UserActions.openTree("@root.yaml")
        alertSeedLocalDocumentChange()
    } else {
        console.log("Could not copy last session data. The last session data is corrupted or does not exist.")
        appSession.copy(new Session())
        await LocalDB.saveSession(appSession)
        console.log("Created new app session with empty data.")
    }

}