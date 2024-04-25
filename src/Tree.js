import Session from  "./Session"
import nestedObj from "./utils/nestedObj"

const {Clipboard} = Session

export default class Tree {

    constructor (data) {
        this.data = data
    }

    selectedNode = null

    copyNode() {
        Clipboard.data.push(structuredClone(Tree.selectedNode))
    }

    pasteNode() {
        const parentNode = Tree.selectedNode
        if (typeof parentNode.value === "Object") return false
        const childNode = Clipboard.lastItem
        parentNode.value[childNode.key] = childNode.value
        parentNode.update()
        nestedObj(Tree.data, parentNode.path, childNode)
    }

    addNode() {
        let nodeToAdd = new Node()
        let originalObject = nestedObj(Tree.data, Tree.selectedNode.path)
        nestedObj(Tree.data, Tree.selectedNode.path, {...originalObject, nodeToAdd.data})
        return nestedObj(Tree.data, Tree.selectedNode.path)
    }

    deleteNode(node) {
        delete node.parent.value[node.key]
        node.DOM.remove()
        nestedObj(Tree.data, Tree.selectedNode.path, undefined)
    }

}