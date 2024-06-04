import appSession from "../resource/appSession"
import * as SessionManager from "../interface/SessionManager"
import Root from "../entity/Root"
import Seed from "../entity/Seed"
import * as FileSystem from "../interface/FileSystem"

import * as LocalDBManager from "../interface/LocalDBManager"
import Query from "../entity/Query"

export async function createRoot(name="root") { 
    
    //create the DB
    let localDB = await LocalDBManager.create()
    
    // Export the database to an Uint8Array
    const data = localDB.export();
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);

    // Create a link to download it
    const a = document.createElement("a");
    a.href = url;
    a.download = name
    a.click();
    window.URL.revokeObjectURL(url);

}

export async function openRoot() { 
    
    const rootHandle = (await window.showOpenFilePicker({multiple: false}))[0]
    console.log(rootHandle)
    if (!(await rootHandle.queryPermission()) === "granted") {
        await rootHandle.requestPermission()
    }
    
    appSession.root = new Root(rootHandle)

    saveSession()

    console.log(`Opened root: ${appSession.root.name}`)

    return appSession.root

}

export async function saveSession() {
    return await SessionManager.saveSession(appSession)
}

export function loadSession() {
    
}

export async function clearSessions () {
    SessionManager.clearSessions()
}

export const Edit = {
    selectedNode: {
        copyNode: (node) => {
            appSession.copiedNode = appSession.selectedNode
            return appSession.copiedNode
        },
        pasteNode: (parentNodeQueryString) => {
            appSession.copiedNode.changeParent(appSession.selectedNode)
            return appSession.selectedNode
        },
        addNode: (key, value) => {
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
        changeDepth: (change) => {
            appSession.selectedNode.changeDepth(change)
            return appSession.selectedNode
        },
        link: (queryString) => {
            new Query(queryString)
            return appSession.selectedNode.linkTo(tieID, endIndex, nodeID)
        }
    }
}

export const Prune = {

    selectedNode: {
        toggleOpen: () => {
            if (appSession.selectedNode.opened) {
                appSession.selectedNode.close()
            } else {
                appSession.selectedNode.open()
            }
            return appSession.selectedNode
        },
        open: () => {
            appSession.selectedNode.open()
            return appSession.selectedNode
        },
        close: () => {
            appSession.selectedNode.close()
            return appSession.selectedNode
        }
    },

    filterNodes: (key) => {
    }

}

export const Navigate = {
    //search는 openTree와 동일해서 제외.
    async openTree (queryString) { //Navigate.plant로 옮길까.
        try {
    
            let seed = new Seed(queryString)
            appSession.seeds.push(seed)
            
            await seed.parse()
            appSession.tree = seed.plant()
            appSession.adress = queryString
    
            saveSession()
    
            return appSession.tree
    
        }
        catch (err) {
            console.error(err, `Failed to open tree by the given query: ${queryString}. the query is formatted wrongly or matching doucment and prop does not exist in the root.`)
        }
    },
    history: {
        pastAdress: () => {
        },
        nextAdress: () => {
        },
    },
    refresh: () => {

    },
    tree: {
        pastSibling() {

        },
        nextSibling() {

        },
        parent() {

        },
        children() {

        }
    },
    selectedNode: {
        stemOut: () => {
            appSession.selectedNode.stemOut()
            return appSession.selectedNode
        },
        plant: async () => {
            let newSeed = new Seed(appSession.selectedNode.pathString())
            await newSeed.parse()
            newSeed.plant()
            return newSeed
        }
    }
}