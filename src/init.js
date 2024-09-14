import * as BrowserSessions from "./interface/BrowserSessions"
import appSession from "./appSession"
import * as UserActions  from "./userActions"
import * as LocalDBManager from "./interface/SqlJsDb"
import BrowserDB from "./interface/BrowserDb"
import * as userActions from "./userActions"
import Logger from "./prototypes/view/Logger"
import * as BrowserFileSystem from "./interface/BrowserFileSystem"
import * as yaml from "yaml"
import { Capacitor } from "@capacitor/core";

export default async function init () {

    let defaultSettings = appSession.settings
    try {
        appSession.settings = {...defaultSettings, ...JSON.parse((await BrowserDB.settings.get("lastUsed")).data)}
    } catch {

    }
    userActions.Visual.set_size()

    //init appSession
    let lastSession = await BrowserSessions.getLastSession()
    console.log("lastSession: ", lastSession)

    if (lastSession?.data) {

        appSession.overrideTempData(lastSession.data)
        console.log("Loaded last session data.", lastSession)
        
        await initAppSession()

        try {
            
        await userActions.Navigate.show_node_("#" + appSession.temp.lastNodeId)

        } catch (err) {

            UserActions.Navigate.show_node_(`${appSession.settingsParsed.entry}`)
            
        }

    } else {

        console.log("Could not copy last session data. The last session data is corrupted or does not exist.")
        await BrowserSessions.saveSession()
        console.log("Created new app session with empty data.")

    }
    
    userActions.Sessions.autosave_on()
    

}

export async function initAppSession () {

    switch (Capacitor.getPlatform()) {

        case "web":
            debugger

            if (!appSession.temp.browser.networkHandle) break
            
            if (!(await appSession.temp.browser.networkHandle?.queryPermission()) === "granted") {
                await appSession.temp.browser.networkHandle?.requestPermission()
            } 
            appSession.browser.networkDirectoryTree = await BrowserFileSystem.listAllFilesAndDirs(
                appSession.temp.browser.networkHandle
            )
            
            appSession.settingsParsed = await yaml.parse(
                await (
                    await appSession.browser.getNetworkTreeSubItem("settings.yaml").handle.getFile()
                ).text()
            )

            appSession.network.DB = await LocalDBManager.blobToDb(
                await appSession.browser.getNetworkTreeSubItem("database").handle.getFile()
            )

            BrowserSessions.saveSession()
    }
    

    return appSession

}