import appSession from "./appSession"
import * as SessionManager from "./interface/BrowserSessions"
import * as LocalDBManager from "./interface/SqlDb"
import parseQuery from "./utils/parseQuery"
import NodeView from "./prototypes/view/NodeView"

import { default as init, initRootDB as init_root_DB, initNetwork } from "./init"

import * as fileSystem from "./interface/BrowserFileSystem"
import BrowserDB from "./interface/BrowserDb"
import Logger from "./prototypes/view/Logger"

import { DateTime } from "luxon"


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

export const Root = {
    async create_root_ (name) {
        //create the DB
        let _name = name || "root"
        let localDB = await LocalDBManager.create(_name)
        
        // Export the database to an Uint8Array
        const data = localDB.export();
        const blob = new Blob([data], { type: "application/octet-stream" });
        fileSystem.downloadFile(name || "root", blob)
    },
    async access_root () {

        return await appSession.temp.rootHandle.requestPermission()
    },
    async open_network () {
        if (window.showDirectoryPicker) {
            let networkDirhandle = await window.showDirectoryPicker()
            await initNetwork(networkDirhandle)
            SessionManager.saveSession()
        } else {
            this.open_network_DB()
        }
        return appSession.network
    },
    async open_network_DB () {
        
        let i = document.createElement('input')
        i.type = "file"
        i.multiple = false
        i.click()

        await (new Promise((resolve, reject) => {
            async function onchange (event) {
                let blob = event.target.files[0]
                appSession.network.name = blob.name || "unknown network", 
                appSession.network.DB = await LocalDBManager.load(blob)
                resolve()
            }
            i.addEventListener("change", onchange)
        }))

        initNetwork(null)

        SessionManager.saveSession()
        
        return appSession.network

    },
    async open_root() {
        

        if (window.showOpenFilePicker) {

            let rootHandle = (await window.showOpenFilePicker({multiple: false}))[0]

            if (!(await rootHandle?.queryPermission()) === "granted") {
                await rootHandle?.requestPermission()
            } 

            appSession.temp.rootHandle = rootHandle
            appSession.root.name = rootHandle.name || "root", 
            appSession.root.DB = await LocalDBManager.load(rootHandle)

        } else {
            
            await Root.open_root_oldway()

        }
        
        init_root_DB(appSession.rootHandle)
        
        return appSession.root
    
    },
    async update_root () {
        Logger.log("saving root, DO NOT LEAVE!")
        let res = await LocalDBManager.update()
        Logger.log("root saved!", "success")
        return res
    },
    async download_root () {
        const data = await appSession.root.DB.export()
        const blob = new Blob([data], { type: "application/octet-stream" });
        return await fileSystem.downloadFile(appSession.root.name, blob)
    },
    async open_root_oldway () {
        
        let i = document.createElement('input')
        i.type = "file"
        i.multiple = false
        i.click()

        await (new Promise((resolve, reject) => {

            async function onchange (event) {
                
                let rootBlob = event.target.files[0]
                
                appSession.temp.rootHandle = null
                appSession.root.name = rootBlob.name || "root", 
                appSession.root.DB = await LocalDBManager.load(rootBlob)
                
                resolve()
            
            }
            
            i.addEventListener("change", onchange)

        }))
    
        console.log(`Opened root: ${appSession.root.name}`)
    
        try {
            let rootName = appSession.root.name
            Navigate.show_node_(`@${rootName}`)
        } catch {
            Navigate.show_node_(`@root`)
        }
    
        SessionManager.saveSession()
        
        return appSession.root
    },
    backup: {
        async create_backup () {        
            let version = DateTime.now().setZone("system")
            let backupFile = fileSystem.createFile(
                appSession.temp.networkDirHandle, 
                appSession.root.name + version, 
                "backup"
            )
            return await fileSystem.copyFile(appSession.temp.rootHandle, backupFile)
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
