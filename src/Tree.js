import Session from  "./Session"
import nestedObj from "./utils/nestedObj"

const {Clipboard} = Session

export default class Tree {

    data = null
    selectedNode = null

    copyNode() {
        Clipboard.data.push(structuredClone(Tree.selectedNode))
    }

    pasteNode() {
        nestedObj(Tree.data, Tree.selectedNode.path, Clipboard.lastItem)
    }

    addNode() {
        let nodeToAdd = new Node()
        let originalObject = nestedObj(Tree.data, Tree.selectedNode.path)
        nestedObj(Tree.data, Tree.selectedNode.path, {...originalObject, nodeToAdd.data})
        return nestedObj(Tree.data, Tree.selectedNode.path)
    }

    deleteNode() {
        nestedObj(Tree.data, Tree.selectedNode.path, undefined)
    }

}