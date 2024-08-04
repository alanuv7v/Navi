import * as SessionManager from "./interface/BrowserSessions"
import appSession from "./appSession"
import * as UserActions  from "./userActions"
import * as LocalDBManager from "./interface/SqlDb"
import BrowserDB from "./interface/BrowserDb"

import * as userActions from "./userActions"
import Logger from "./prototypes/view/Logger"

import * as BrowserFileSystem from "./interface/BrowserFileSystem"

import * as yaml from "yaml"

export default async function init () {

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
        
        await initNetwork(lastSession.data.browser.networkHandle)

        try {
            
        await userActions.Navigate.show_node_("#" + appSession.temp.lastNodeId)

        } catch (err) {

            UserActions.Navigate.show_node_(`@${appSession.network.name}`)
            
        }

    } else {

        console.log("Could not copy last session data. The last session data is corrupted or does not exist.")
        await SessionManager.saveSession()
        console.log("Created new app session with empty data.")

    }
    
    userActions.Sessions.autosave_on()
    

}

export async function initNetwork (networkHandle) {
    
    if (networkHandle) {
        
        if (!(await networkHandle?.queryPermission()) === "granted") {
            await networkHandle?.requestPermission()
        } 

        appSession.temp.browser.networkHandle = networkHandle
        appSession.browser.networkDirectoryTree = await BrowserFileSystem.listAllFilesAndDirs(networkHandle)
        
        appSession.settingsParsed = await yaml.parse(
            await (
                await appSession.browser.getNetworkTreeSubItem("settings.yaml").handle.getFile()
            ).text()
        )

        appSession.network.DB = await LocalDBManager.load(
            await appSession.browser.getNetworkTreeSubItem("database").handle.getFile()
        )

    }
    
    try {
        userActions.Navigate.show_node_(`@${appSession.network.name}`)
    } catch {
        userActions.Navigate.show_node_(`@origin`)
    }

    return appSession.network

}