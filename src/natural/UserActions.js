import appSession from "../resource/appSession"
import RootModel from "../entity/model/RootModel"
import * as SessionManager from "../interface/SessionManager"
import * as LocalDBManager from "../interface/LocalDBManager"
import parseQuery from "../tech/parseQuery"
import NodeView from "../entity/view/NodeView"

import refs from "../resource/DOMRefs"
import RootData from "../entity/static/RootData"


export const sessions = {
    async getAllSessions() {
        return await SessionManager.getAllSessions()
    },
    async saveSession(id) {
        return await SessionManager.saveSession(id, appSession)
    },
    async loadSession(id) {
        return await SessionManager.loadSession(id)
    },
    async clearSessions () {
        return await SessionManager.clearAllSessions()
    }
}




export async function createRoot(name) { 
    
    //create the DB
    let localDB = await LocalDBManager.create()
    
    // Export the database to an Uint8Array
    const data = localDB.export();
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);

    // Create a link to download it
    const a = document.createElement("a");
    a.href = url;
    a.download = name || "root"
    a.click();
    window.URL.revokeObjectURL(url);

}

export async function openRoot() { 
    
    const rootHandle = (await window.showOpenFilePicker({multiple: false}))[0]
    console.log(rootHandle)
    if (!(await rootHandle.queryPermission()) === "granted") {
        await rootHandle.requestPermission()
    }

    let name = rootHandle.name
    let DB = await LocalDBManager.load(rootHandle)
    
    appSession.data.root = new RootData(name, DB)

    SessionManager.saveSession()
    console.log(`Opened root: ${appSession.root.name}`)

    return appSession.root

}


export const Edit = {
    copyNode: (node) => {
        appSession.copiedNode = appSession.selectedNode
        return appSession.copiedNode
    },
    pasteNode: (parentNodeQueryString) => {
        appSession.copiedNode.changeParent(appSession.selectedNode)
        return appSession.selectedNode
    },
    addLinkedNode: (key, value) => {
        //let parentNode = Tree.selectedNode
        //this.pasteNode(parentNode)
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

export const Prune = {

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

export const Navigate = {
    //search는 openTree와 동일해서 제외.
    async showNode (queryString) { //Navigate.plant로 옮길까.
        
        try {
            debugger
            let nodeData = (await parseQuery(queryString))[0]
            console.log(nodeData)
            console.log(new NodeView(...nodeData))
            let nodeView = new NodeView(...nodeData)
            nodeView.plant()
            
            SessionManager.saveSession()
    
        }
        
        catch (err) {
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