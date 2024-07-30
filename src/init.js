import * as SessionManager from "./interface/BrowserSessions"
import appSession from "./appSession"
import * as UserActions  from "./userActions"
import * as LocalDBManager from "./interface/SqlDb"
import BrowserDB from "./interface/BrowserDb"

import * as userActions from "./userActions"
import Logger from "./prototypes/view/Logger"

import * as fileSystem from "./interface/BrowserFileSystem"

export default async function init () {

    appSession.browserDB = BrowserDB

    let defaultSettings = appSession.settings
    try {
        appSession.settings = {...defaultSettings, ...JSON.parse((await BrowserDB.settings.get("lastUsed")).data)}
    } catch {

    }
    userActions.Visual.set_size()

    //init appSession
    let lastSession = await SessionManager.getLastSession()
    console.log("lastSession: ", lastSession)

    if (lastSession?.data) {

        appSession.copy(lastSession.data)
        console.log("Loaded last session data.")
        
        await initRootDB(lastSession.data.rootHandle)

        try {
            
            await userActions.Navigate.show_node_("#" + appSession.temp.lastNodeId)

        } catch (err) {

            try {
                let rootName = appSession.rootName
                UserActions.Navigate.show_node_(`@${rootName}`)
            } catch {
                UserActions.Navigate.show_node_(`@root`)
            }
            
        }

    } else {

        console.log("Could not copy last session data. The last session data is corrupted or does not exist.")
        await SessionManager.saveSession()
        console.log("Created new app session with empty data.")

    }
    
    userActions.Sessions.autosave_on()
    

}

export async function initRootDB (rootHandle) {

    console.log("initializing root DB...")

    try {
        if (!(await rootHandle?.queryPermission()) === "granted") {
            await rootHandle?.requestPermission()
        } 
        appSession.root.name = rootHandle.name, 
        appSession.root.DB = await LocalDBManager.load(rootHandle)

        console.log("initialized root DB.")

        return appSession.root.DB

    } catch (err) {
        Logger.log(`failed to initialise root DB. error: 
${err}`, "error")
   }
}

export async function initNetwork (networkDirHandle) {

    if (networkDirHandle) {
            
        if (!(await networkDirHandle?.queryPermission()) === "granted") {
            await networkDirHandle?.requestPermission()
        } 
        
        appSession.temp.network.handle = networkDirHandle
        appSession.temp.network.DB.handle = 
            (await fileSystem.listAllFilesAndDirs(networkDirHandle))
            .find(item => {
                return item.name === "database"
            }).handle
        
        appSession.network.name = networkDirHandle.name || "new network"
        
        appSession.network.DB = await LocalDBManager.load(
            await appSession.temp.network.DB.handle.getFile()
        )

    }
    
    try {
        userActions.Navigate.show_node_(`@${appSession.network.name}`)
    } catch {
        userActions.Navigate.show_node_(`@origin`)
    }

    return appSession.network

}