import appSession from "./appSession"
import * as SessionManager from "./interface/BrowserSessions"
import * as SqlDb from "./interface/SqlDb"
import parseQuery from "./utils/parseQuery"
import NodeView from "./prototypes/view/NodeView"

import { default as init, initNetwork as init_root_DB, initNetwork } from "./init"

import * as BrowserFileSystem from "./interface/BrowserFileSystem"
import BrowserDB from "./interface/BrowserDb"
import Logger from "./prototypes/view/Logger"

import { DateTime } from "luxon"

import { Capacitor } from '@capacitor/core';
import { Filesystem as CapacitorFs, Directory, Encoding } from '@capacitor/filesystem';
import write_blob from "capacitor-blob-writer";

import * as yaml from "yaml"


import aboutDOM from "./prototypes/view/About"

import defaultSettings from "./defaultSettings.yaml"
import refs from "./DOMRefs"



export const Fix = {
    init,
    init_root_DB
}

export const Sessions = {
    autosave_on () {
        if (appSession.settings.autosaveInterval < 10*1000) return false
        appSession.settings.autosave = true
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
        return await SessionManager.loadSession(id || "lastUsed")
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

                if (await CapacitorFs.checkPermissions() != 'granted') await CapacitorFs.requestPermissions()
                

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
            
                if (await CapacitorFs.checkPermissions() != 'granted') await CapacitorFs.requestPermissions()
                break
            
            case "web":

                if (window.showDirectoryPicker) {
                    let networkDirhandle = await window.showDirectoryPicker()
                    await initNetwork(networkDirhandle)
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
            
                if (await CapacitorFs.checkPermissions() != 'granted') await CapacitorFs.requestPermissions()
                break
            
            case "web":
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

                Logger.log("saving root, DO NOT LEAVE!")
                let res = await SqlDb.update()
                Logger.log("root saved!", "success")
                return res

        }

    },
    backup: {
        async create_backup () {        
            let version = DateTime.now().setZone("system")
            let backupFile = BrowserFileSystem.createFile(
                appSession.temp.networkDirHandle, 
                appSession.network.name + version, 
                "backup"
            )
            return await BrowserFileSystem.copyFile(appSession.temp.browser.networkHandle, backupFile)
        }  
    }
}

export const Edit = {
    copy_node: () => {
        appSession.copiedNode = appSession.selectedNode
        return appSession.copiedNode
    },
    paste_node: () => {
        appSession.copiedNode.changeParent(appSession.selectedNode)
        return appSession.selectedNode
    },
    add_linked_node: (key, value) => {
        appSession.selectedNode.addChild(key, value)
        return appSession.selectedNode
    },
    delete_node: () => {
        return appSession.selectedNode.delete()
    },
    change_order: (change) => {
        appSession.selectedNode.changeOrder(change)
        return appSession.selectedNode
    },
    link: (queryString) => {
        new Query(queryString)
        return appSession.selectedNode.linkTo(tieID, endIndex, nodeID)
    }
}

export const Prune = {

    toggle_open: () => {
        if (appSession.selectedNode.opened) {
            appSession.selectedNode.close()
        } else {
            appSession.selectedNode.open()
        }
        return appSession.selectedNode
    },

    global_filter: (key) => {
    }

}

export const Navigate = {
    //search는 openTree와 동일해서 제외.
    async show_node_ (queryString) { //Navigate.plant로 옮길까.

        Logger.log(`showing ${queryString}`)
        
        let res = (await parseQuery(queryString))
        console.log("parseQuery res: ", res)
        let nodeView = new NodeView(...res[0])
        nodeView.plant()
        
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

let global = () => document.querySelector('#App')
let pureCssValue = (str) => Number(str.match(/[0-9]+/)[0])

export const Visual = {
    set_size () {
        global().style.fontSize = appSession.settings.style.fontSize + "px"
    },
    size_up () {
        appSession.settings.style.fontSize++
        Visual.set_size()
    },
    size_down () {
        appSession.settings.style.fontSize--
        Visual.set_size()
    }
}

export const Settings = {
    async save () {
        return await BrowserDB.settings.put(
            {   
                id: "lastUsed",
                data: JSON.stringify(appSession.settings)
            }
        )
    },
    async clear () {
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