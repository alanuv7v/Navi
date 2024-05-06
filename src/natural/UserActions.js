import appSession from "../resource/appSession"
import * as LocalDB from "../interface/LocalDB"
import Root from "../entity/Root"
import Seed from "../entity/Seed"
import Query from "../entity/Query"
import DB from "../resource/DB"
import * as FileSystem from "../tech/FileSystem"

export async function openRoot() {
    
    const rootHandle = await window.showDirectoryPicker()
    
    if (!(await rootHandle.queryPermission()) === "granted") {
        await rootHandle.requestPermission()
    }
    
    appSession.root = new Root(rootHandle)

    saveSession()

    console.log(`Opened root: ${appSession.root.name}`)

}

export async function openTree(queryString) {
    try {
            
        let adress = queryString

        let rootQuery = new Query(queryString)
        
        let {document, treeData} = await rootQuery.parse()
        let seed = new Seed(document, treeData)
        console.log(document, treeData, seed)
        let tree = seed.grow()
        
        appSession.adress = adress
        appSession.seed = seed
        appSession.tree = tree

        saveSession()

        return tree

    }
    catch (err) {
        console.error(err, `Failed to open tree by the given query: ${queryString}. the query is formatted wrongly or matching doucment and prop does not exist in the root.`)
    }
}

export async function saveChange() {
    //saveDocument가 아닌 이유: Tree 안에는 stemOut으로 연결된 타 문서도 있을 수 있음. 
    //Tree를 수정함으로써 타 문서도 수정했다면, 씨앗 문서 뿐만 아니라 타 문서의 변경사항도 저장해야 함.
    return await FileSystem.writeToFile(appSession.seed.document.handle, await appSession.seed.stringify())
}

export async function saveSession() {
    return await LocalDB.saveSession(appSession)
}

export function loadSession () {
    
}

export async function clearDB () {
    return await DB.delete()
}


export function createDocument () {
}

export const Edit = {
    selectedNode: {
        copyNode: (node) => {
            appSession.tree.copyNode(appSession.selectedNode)
        },
        pasteNode: (parentNodeQueryString) => {
            appSession.tree.pasteNode(appSession.selectedNode)
        },
        addNode: (key, value) => {
            //let parentNode = Tree.selectedNode
            //this.pasteNode(parentNode)
            appSession.selectedNode.addChild(key, value)
        },
        deleteNode: () => {
            appSession.selectedNode.delete()
        },
        changeOrder: (change) => {
            appSession.tree.selectedNode.changeOrder(change)
        },
        changeDepth: (change) => {
            appSession.tree.selectedNode.changeDepth(change)
        },
        link: (targetQueryString) => {
            appSession.tree.selectedNode.linkTo(targetQueryString)
        }
    }
}

export const Prune = {

    selectedNode: {
        hideNode: () => {
            appSession.tree.selectedNode.hide()
        },
    },

    filterNodes: (key) => {
    }

}

export const Navigate = {
    //search는 openTree와 동일해서 제외.
    selectedNode: {
        stemOut: () => {
            appSession.tree.selectedNode.stemOut()
        },
        plantNew: (queryString) => {
            Presenter.renderTree(queryString)
        }
    }
}