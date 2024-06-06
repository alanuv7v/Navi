import * as SessionManager from "../interface/SessionManager"
import appSession from "../resource/appSession"
import * as UserActions  from "./UserActions"

export default async function init () {

    await import("../resource/BrowserDB")
    console.log("Imported BrowserDB.")
    
    //init appSession
    let lastSession = await SessionManager.getLastSession()

    if (lastSession) {
        appSession.copy(lastSession.data)
        console.log("Loaded last session data.")

        //show root node
        UserActions.Navigate.showNode("root")

    } else {

        console.log("Could not copy last session data. The last session data is corrupted or does not exist.")
        await SessionManager.saveSession()
        console.log("Created new app session with empty data.")
        
    }
}