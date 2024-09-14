//@ts-check
import appSession from "./appSession"
import * as SessionManager from "./interface/BrowserSessions"
import * as SqlDb from "./interface/SqlJsDb"
import parseQuery from "./utils/parseQuery"
import NodeView from "./prototypes/view/NodeView"

import { default as init, initAppSession as init_appSession, initAppSession } from "./init"

import * as BrowserFileSystem from "./interface/BrowserFileSystem"
import BrowserDB from "./interface/BrowserDb"
import Logger from "./prototypes/view/Logger"

// @ts-ignore
import { DateTime } from "luxon"

import { Capacitor } from '@capacitor/core';
import { Filesystem as CapacitorFs, Directory, Encoding } from '@capacitor/filesystem';
import write_blob from "capacitor-blob-writer";

import * as yaml from "yaml"


import aboutDOM from "./prototypes/view/About"

// @ts-ignore
import defaultSettings from "./defaultSettings.yaml"
import refs from "./DOMRefs"



export const Fix = {
    init,
    init_appSession
}

export const Sessions = {
    autosave_on () {
        if (appSession.settings.autosaveInterval < 10*1000) return false
        appSession.settings.autosave = true
        // @ts-ignore
        appSession.settings.autosaveIntervalId = setTimeout(async () => {
            await Sessions.save_session_()
        }, appSession.settings.autosaveInterval);
        return appSession.settings.autosaveIntervalId
    },
    autosave_off () {
        appSession.settings.autosave = false
        clearInterval(appSession.settings.autosaveIntervalId)
    },
    set_autosave_interval (value) {
        appSession.settings.autosaveInterval = Math.max(10*1000, value)
        Sessions.autosaveOff()
        Sessions.autosaveOn()
    },
    async get_all_sessions() {
        return await SessionManager.getAllSessions()
    },
    async save_session_ (id) {
        let res = await SessionManager.saveSession(id || "lastUsed")
        Logger.log("session saved", "success")
        return res
    },
    async load_session_ (id) {
        return await SessionManager.getSession(id || "lastUsed")
    },
    async clear_session () {
        return await SessionManager.clearAllSessions()
    }
}

export const Network = {
    async create_ (networkName="A Network") {
                
        //create the DB
        const sqlDB = await SqlDb.create(networkName)
        
        // Export the database to an Uint8Array
        const dbData = sqlDB.export();
        const dbBlob = new Blob([dbData], { type: "application/octet-stream" });

        const defaultSettingsString = await yaml.stringify(defaultSettings)
        const settingsBlob = new Blob([defaultSettingsString], {type: "text/plain;charset=UTF-8"});

        switch (Capacitor.getPlatform()) {

            case "android":

                // make network dir
                await CapacitorFs.mkdir({
                    path: Directory.Documents,
                    directory: Directory.Documents,
                    recursive: false,
                  });

                //make backup dir
                await CapacitorFs.mkdir({
                    path: "backup",
                    directory: Directory.Documents,
                    recursive: false,
                });

                //make media dir
                await CapacitorFs.mkdir({
                    path: "media",
                    directory: Directory.Documents,
                    recursive: false,
                });

                //make databse file
                //used a capacitor plugin to write a binary instead of base64 encoded text
                await write_blob({
                        path: "database",
                        directory: Directory.Documents,
                        blob: dbBlob,
                        fast_mode: true,
                        recursive: false,
                });
      
                //make settings.yaml file
                await CapacitorFs.writeFile({
                    path: "settings.yaml",
                    data: settingsBlob,
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                });

                if ((await CapacitorFs.checkPermissions()).publicStorage != 'granted') await CapacitorFs.requestPermissions()
                

                break;

            case "web":

                try {
                    let rootDir = await BrowserFileSystem.showDirectoryPicker()
    
                    // make network dir
                    let networkDir = await BrowserFileSystem.createFolder(rootDir, networkName)
    
                    //make backup dir
                    await BrowserFileSystem.createFolder(networkDir, "backup")
    
                    //make media dir
                    await BrowserFileSystem.createFolder(networkDir, "media")
    
                    //make databse file
                    let dbHandle = await BrowserFileSystem.createFile(networkDir, "database")
                    await BrowserFileSystem.writeToFile(dbHandle, dbBlob)
                    
                    //make settings.yaml file
                    let settingsHandle = await BrowserFileSystem.createFile(networkDir, "settings", "yaml")
                    await BrowserFileSystem.writeToFile(settingsHandle, settingsBlob)
    
                }
                catch (err) {
                    Logger.log(err, "warning")
                    Logger.log("Your web platform does not support FileSystemAPI. Create your own network directory that includes 'media' and 'backup' folders, by yourself.", "warning")
                    BrowserFileSystem.downloadFile(networkName, dbBlob)
                    BrowserFileSystem.downloadFile("settings.yaml", settingsBlob)
                }

                break;
        }


    },

    async open_ () {

        switch (Capacitor.getPlatform()) {

            case "android":
            
                if ((await CapacitorFs.checkPermissions()).publicStorage != 'granted') await CapacitorFs.requestPermissions()
                break
            
            case "web":

                // @ts-ignore
                if (window?.showDirectoryPicker) {
                    // @ts-ignore
                    appSession.temp.browser.networkHandle = await window.showDirectoryPicker()
                    await initAppSession()
                    SessionManager.saveSession()
                } else {
                    /* this.open_network_DB() */
                }
                return appSession.network

        }
        
    },

    async access () {

        switch (Capacitor.getPlatform()) {

            case "android":
            
                if ((await CapacitorFs.checkPermissions()).publicStorage != 'granted') await CapacitorFs.requestPermissions()
                break
            
            case "web":
                // @ts-ignore
                return await appSession.temp.browser.networkHandle.requestPermission()

        }
        
    },
    /* async open_network_DB () {
        
        let i = document.createElement('input')
        i.type = "file"
        i.multiple = false
        i.click()

        await (new Promise((resolve, reject) => {
            async function onchange (event) {
                let blob = event.target.files[0]
                appSession.network.name = blob.name || "unknown network", 
                appSession.network.DB = await SqlDb.load(blob)
                resolve()
            }
            i.addEventListener("change", onchange)
        }))

        initNetwork(null)

        SessionManager.saveSession()
        
        return appSession.network

    }, */
    async update_database () {

        switch (Capacitor.getPlatform()) {

            //실시간 transaction이 되므로 안드로이드는 할 게 없다.
            /* case "android":
                break */
            
            case "web":

            

                Logger.log("Saving the database, DO NOT LEAVE!")
                let res = await SqlDb.update()
                Logger.log("The database is saved!", "success")
                return res

        }

    },
    backup: {
        async create_backup () {        
            let version = DateTime.now().setZone("system")
            let backupFile = BrowserFileSystem.createFile(
                // @ts-ignore
                appSession.temp.networkDirHandle, 
                appSession.network.name + version, 
                "backup"
            )
            return await BrowserFileSystem.copyFile(appSession.temp.browser.networkHandle, backupFile)
        }  
    }
}

export const Navigate = {
    //search는 openTree와 동일해서 제외.
    async show_node_ (queryString) { //Navigate.plant로 옮길까.

        Logger.log(`showing ${queryString}`)
        
        let res = (await parseQuery(queryString))
        console.log("parseQuery res: ", res)

         if (res) {
            new NodeView(...res[0])
                .plant()
        }
        
        SessionManager.saveSession()
        return res

    },

    history: {
        past_adress: () => {
        },
        next_adress: () => {
        },
    },

}


export const Edit = {
    //NodeView의 일부 메소드 가져올것.
}

export const Prune = {

    toggle_open: () => {
        // @ts-ignore
        if (appSession.selectedNode.opened) {
            // @ts-ignore
            appSession.selectedNode.close()
        } else {
            // @ts-ignore
            appSession.selectedNode.open()
        }
        return appSession.selectedNode
    },

    // @ts-ignore
    global_filter: (key) => {
    }

}

let global = () => document.querySelector('#App')
// @ts-ignore
let pureCssValue = (str) => Number(str.match(/[0-9]+/)[0])

export const Visual = {
    set_size () {
        // @ts-ignore
        global().style.font_size = appSession.settings.style.font_size + "px"
    },
    size_up () {
        appSession.settings.style.font_size++
        Visual.set_size()
    },
    size_down () {
        appSession.settings.style.font_size--
        Visual.set_size()
    }
}

export const Settings = {
    async save () {
        // @ts-ignore
        return await BrowserDB.settings.put(
            {   
                id: "lastUsed",
                data: JSON.stringify(appSession.settings)
            }
        )
    },
    async clear () {
        // @ts-ignore
        return await BrowserDB.settings.clear()
    },
    async clear_indexedDB () {
        return await indexedDB.deleteDatabase("Root")
    }
}


export const Help = {
    About () {
        refs("Overlay").append(aboutDOM)
        return aboutDOM.showModal()
    },
    Docs () {
        let a = document.createElement("a")
        a.href = "" //docs 주소
        a.click()
    },
    asfd () {
        console.log(defaultSettings)
    }
}