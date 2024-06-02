import appSession from "../resource/appSession"
import * as SessionManager from "../interface/SessionManager"
import Root from "../entity/Root"
import Seed from "../entity/Seed"
import Query from "../entity/Query"
import BrowserDB from "../resource/BrowserDB"
import * as FileSystem from "../interface/FileSystem"

import * as LocalDBManager from "../interface/LocalDBManager"

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

export async function saveChange() {

    let res = []
    appSession.seeds.forEach(async (seed) => {
        console.log(await seed.stringify())
        res.push(await FileSystem.writeToFile(seed.document.handle, await seed.stringify()))
    })
    return res

}

export async function saveSession() {
    return await SessionManager.saveSession(appSession)
}

export function loadSession () {
    
}

export async function clearDB () {
    return await BrowserDB.delete()
}


export function createDocument (name) {
    appSession.root.createDocument(name)
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
            let originalParent = appSession.selectedNode.parent
            appSession.selectedNode.delete()
            return originalParent
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
            appSession.selectedNode.linkTo(queryString)
            return appSession.selectedNode
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