import * as SessionManager from "../interface/SessionManager"
import appSession from "../resource/appSession"
import * as UserActions  from "./userActions"
import RootData from "../entity/static/RootData"
import * as LocalDBManager from "../interface/LocalDBManager"
import BrowserDB from "../resource/BrowserDB"

import * as userActions from "./userActions"

export default async function init () {

    let defaultSettings = appSession.settings
    try {
        appSession.settings = {defaultSettings, ...JSON.parse((await BrowserDB.settings.get("lastUsed")).data)}
    } catch {

    }
    userActions.Visual.setSize()
    

    //init appSession
    let lastSession = await SessionManager.getLastSession()

    if (lastSession) {

        appSession.copy(lastSession.data)
        console.log("Loaded last session data.")
        console.log(lastSession)
        initRootDB(lastSession.data.rootHandle)

    } else {

        console.log("Could not copy last session data. The last session data is corrupted or does not exist.")
        await SessionManager.saveSession()
        console.log("Created new app session with empty data.")

    }
    

}

export async function initRootDB (rootHandle) {
    if (!(await rootHandle?.queryPermission()) === "granted") {
        await rootHandle?.requestPermission()
    } 
    appSession.root.name = rootHandle.name, 
    appSession.root.DB = await LocalDBManager.load(rootHandle)
    
    //show root node
    UserActions.Navigate.showNode_("@root")
}