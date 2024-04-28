import appSession from "./appSession"
import * as TreeManager from "./Directors/TreeManager"
import * as LocalDBManager from "./Directors/LocalDBManager"
import * as ImportManager from "./Directors/ImportManager"

export async function openRoot() {
    
    const docsHandle = await window.showDirectoryPicker()
    
    if (!(await docsHandle.queryPermission()) === "granted") {
        await docsHandle.requestPermission()
    }
    
    appSession.docs = await ImportManager.listAllFilesAndDirs(docsHandle)
    appSession.config = await ImportManager.readConfig(appSession.docs)
    appSession.root = ImportManager.getRoot(appSession.docs)

}

export function openTree(queryString) {

    let treeData = ImportManager.getTreeDataFromQuery(queryString)
    appSession.tree = treeData
    TreeManager.openTree(treeData)

    return appSession.tree

}

export function saveChange() {

}



export function createDocument () {
}

export const Edit = {
    title: () => {

    },
    node: {
        copyNode: (node) => {
            //clipboard.push(node)
            appSession.tree.copyNode()
        },
        pasteNode: (parentNodeQueryString) => {
            //let parentNode = Tree.getNode(parentNodeQueryString)
            //parentNode.append(clipboard.lastItem)
            appSession.tree.pasteNode()
        },
        addNode: () => {
            //let parentNode = Tree.selectedNode
            //this.pasteNode(parentNode)
            appSession.tree.addNode()
        },
        deleteNode: () => {
            appSession.tree.deleteNode()
        },
        changeOrder: (change) => {
            appSession.tree.selectedNode.changeOrder(change)
        },
        changeDepth: (change) => {
            appSession.tree.selectedNode.changeDepth(change)
        },
        linkNode: (targetNodeQueryString) => {
            appSession.tree.selectedNode.linkTo(targetNodeQueryString)
        }
    }
}

export const Prune = {

    hideNode: () => {
    },
    filterNodes: () => {
    }

}

export const Navigate = {
    search: (queryString) => {
        Presenter.renderTree(queryString)
    },
    stemOut: (parentNode) => {
        parentNode.stemOut()
    },
    plantNew: (queryString) => {
        Presenter.renderTree(queryString)
    }
}
