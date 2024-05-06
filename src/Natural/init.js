import * as LocalDB from "../Directors/LocalDB"
import * as ImportManager from "../Directors/ImportManager"
import * as Garner from "../Workers/Garner"
import appSession from "../Resources/appSession"
import Session from "../Entities/Session"

import deepEqual from "deep-equal"
import Query from "../Entities/Query"
import Seed from "../Entities/Seed"
import Root from "../Entities/Root"

import * as UserActions  from "./UserActions"

function copySessionData(target, source) {
    for (let e of Object.entries(source)) {
        if (e[0]==="autosave") continue
        target[e[0]] = e[1]
    }
}

async function createCleanSession() {
    let cleanSession = new Session()
    copySessionData(appSession, cleanSession)
    await LocalDB.saveSession(cleanSession)
}

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
        
    try {
        console.log("loaded last session data.")
        await loadLastSession()
    }
    catch {
        console.log("Could not create app session from last session data. The last session data is corrupted or does not exist.")
        await createCleanSession()
        console.log("Created new app session with empty data.")
    }

    try {
        alertSeedLocalDocumentChange()
    } 
    finally {
        appSession.autosave = true
        appSession.root = new Root()
        appSession.seed = new Seed(appSession.root.handle)
        await appSession.seed.grow()
    }
    
    try {
    }
    catch {
        
    }

    let lastSession = await LocalDB.getLastSession()
    if (lastSession) {
        copySessionData(appSession, lastSession)
        UserActions.openTree("@root.yaml")
    } else {
        createCleanSession()
    }

}