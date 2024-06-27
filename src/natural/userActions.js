import appSession from "../resource/appSession"
import RootModel from "../entity/model/RootModel"
import * as SessionManager from "../interface/SessionManager"
import * as LocalDBManager from "../interface/LocalDBManager"
import parseQuery from "../tech/parseQuery"
import NodeView from "../entity/view/NodeView"

import refs from "../resource/DOMRefs"
import RootData from "../entity/static/RootData"

import { default as init, initRootDB } from "./init"

import * as fileSystem from "../interface/FileSystem"
import BrowserDB from "../resource/BrowserDB"
import Logger from "../tech/gui/Logger"


const _initRootDB = async () => await initRootDB(appSession.temp.rootHandle)


async function _init() { 
    init()
}

const Sessions = {
    autosaveOn () {
        if (appSession.settings.autosaveInterval < 10*1000) return false
        appSession.settings.autosave = true
        appSession.settings.autosaveIntervalId = setTimeout(async () => {
            await Sessions.saveSession_()
        }, appSession.settings.autosaveInterval);
        return appSession.settings.autosaveIntervalId
    },
    autosaveOff () {
        appSession.settings.autosave = false
        clearInterval(appSession.settings.autosaveIntervalId)
    },
    setAutosaveInterval_ (value) {
        appSession.settings.autosaveInterval = Math.max(10*1000, value)
        Sessions.autosaveOff()
        Sessions.autosaveOn()
    },
    async getAllSessions() {
        return await SessionManager.getAllSessions()
    },
    async saveSession_(id) {
        let res = await SessionManager.saveSession(id || "lastUsed")
        Logger.log("session saved", "success")
        return res
    },
    async loadSession_(id) {
        return await SessionManager.loadSession(id || "lastUsed")
    },
    async clearSessions () {
        return await SessionManager.clearAllSessions()
    }
}

const Root = {
    async createRoot_(name) {
        //create the DB
        let localDB = await LocalDBManager.create()
        
        // Export the database to an Uint8Array
        const data = localDB.export();
        const blob = new Blob([data], { type: "application/octet-stream" });
        fileSystem.downloadFile(name || "root", blob)
    },
    async accessRoot() {
        return await appSession.temp.rootHandle.requestPermission()
    },
    async openRoot() {

        if (window.showOpenFilePicker) {

            let rootHandle = (await window.showOpenFilePicker({multiple: false}))[0]

            if (!(await rootHandle.queryPermission()) === "granted") {
                await rootHandle.requestPermission()
            }

            appSession.temp.rootHandle = rootHandle
            appSession.root.name = rootHandle.name, 
            appSession.root.DB = await LocalDBManager.load(rootHandle)

        } else {

            let i = document.createElement('input')
            i.type = "file"
            i.multiple = false
            i.click()

            await (new Promise((resolve, reject) => {

                async function onchange (event) {
                    
                    let rootBlob = event.target.files[0]
                    
                    appSession.temp.rootHandle = null
                    appSession.root.name = rootBlob.name, 
                    appSession.root.DB = await LocalDBManager.load(rootBlob)
                    
                    resolve()
                
                }
                
                i.addEventListener("change", onchange)

            }))

        }
    
        console.log(`Opened root: ${appSession.root.name}`)
    
        Navigate.showNode_("@root")
    
        SessionManager.saveSession()
        
        return appSession.root
    
    },
    async updateRoot() {
        return await LocalDBManager.update()
    },
    async downloadRoot() {
        const data = await appSession.root.DB.export()
        const blob = new Blob([data], { type: "application/octet-stream" });
        return await fileSystem.downloadFile(appSession.root.name, blob)
    },
}

const Edit = {
    copyNode: () => {
        appSession.copiedNode = appSession.selectedNode
        return appSession.copiedNode
    },
    pasteNode: () => {
        appSession.copiedNode.changeParent(appSession.selectedNode)
        return appSession.selectedNode
    },
    addLinkedNode: (key, value) => {
        appSession.selectedNode.addChild(key, value)
        return appSession.selectedNode
    },
    deleteNode: () => {
        return appSession.selectedNode.delete()
    },
    changeOrder: (change) => {
        appSession.selectedNode.changeOrder(change)
        return appSession.selectedNode
    },
    link: (queryString) => {
        new Query(queryString)
        return appSession.selectedNode.linkTo(tieID, endIndex, nodeID)
    }
}

const Prune = {

    toggleOpen: () => {
        if (appSession.selectedNode.opened) {
            appSession.selectedNode.close()
        } else {
            appSession.selectedNode.open()
        }
        return appSession.selectedNode
    },

    globalFilterNodes: (key) => {
    }

}

const Navigate = {
    //search는 openTree와 동일해서 제외.
    async showNode_ (queryString) { //Navigate.plant로 옮길까.
        
        try {
            let res = (await parseQuery(queryString))
            let nodeView = new NodeView(...res[0])
            nodeView.plant()
            
            SessionManager.saveSession()
    
        }
        
        catch (err) {
            console.trace()
            console.error(err, `Failed to show node by the given query: "${queryString}". the query is formatted wrongly or matching node not exist in the root.`)
        }

    },

    history: {
        pastAdress: () => {
        },
        nextAdress: () => {
        },
    },

}

let global = () => document.querySelector('#App')
let pureCssValue = (str) => Number(str.match(/[0-9]+/)[0])

const Visual = {
    setSize () {
        global().style.fontSize = appSession.settings.style.fontSize + "px"
    },
    sizeUp () {
        appSession.settings.style.fontSize++
        Visual.setSize()
    },
    sizeDown () {
        appSession.settings.style.fontSize--
        Visual.setSize()
    }
}

const Settings = {
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
    }
}

export {Root, Sessions, Navigate, Prune, Edit, Visual, _init, _initRootDB}