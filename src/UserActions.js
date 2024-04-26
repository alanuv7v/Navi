import appSession from "./appSession"
const {tree} = appSession

export function createDocument () {
}

export const Edit = {

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
