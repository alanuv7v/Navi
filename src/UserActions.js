import appSession from "./appSession"
const {tree} = appSession
import * as TreeManager from "./Directors/TreeManager"
import * as LocalDBManager from "./Directors/LocalDBManager"

export function openRoot() {

}

export function openTree(queryString) {
  let treeData
  appSession.tree = treeData
  TreeManager.openTree(treeData)
  appSession.root
    global.root = handle
    global.docs = await listAllFilesAndDirs(handle)
    global.root.config = await parseDocumentHandle(global.docs.find((doc) => {return doc.name === "_config.yaml"}).handle)
    if (!(await handle.queryPermission()) === "granted") {
      await handle.requestPermission()
    } 
    return true
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
      tree.copyNode()
    },
    pasteNode: (parentNodeQueryString) => {
      //let parentNode = Tree.getNode(parentNodeQueryString)
      //parentNode.append(clipboard.lastItem)
      tree.pasteNode()
    },
    addNode: () => {
      //let parentNode = Tree.selectedNode
      //this.pasteNode(parentNode)
      tree.addNode()
    },
    deleteNode: () => {
      tree.deleteNode()
    },
    changeOrder: (change) => {
      tree.selectedNode.changeOrder(change)
    },
    changeDepth: (change) => {
      tree.selectedNode.changeDepth(change)
    },
    linkNode: (targetNodeQueryString) => {
      tree.selectedNode.linkTo(targetNodeQueryString)
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
