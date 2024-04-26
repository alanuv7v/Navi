import nestedObj from "../Workers/nestedObj"
import Node from "./Node"


export default class Tree {

    constructor (appSession, data) {
        this.appSession = appSession
        this.data = data
    }

    selectedNode = null

    copyNode() {
        appSession.clipboard.data.push(structuredClone(this.selectedNode))
    }

    pasteNode() {
        const parentNode = this.selectedNode
        if (typeof parentNode.value === "Object") return false
        const childNode = appSession.clipboard.lastItem
        parentNode.value[childNode.key] = childNode.value
        parentNode.update()
        nestedObj(this.data, parentNode.path, childNode)
    }

    addNode() {
        let nodeToAdd = new Node()
        let originalObject = nestedObj(this.data, this.selectedNode.path)
        let dataToAdd = nodeToAdd.data
        nestedObj(this.data, this.selectedNode.path, {...originalObject, dataToAdd})
        return nestedObj(this.data, this.selectedNode.path)
    }

    deleteNode(node) {
        delete node.parent.value[node.key]
        node.DOM.remove()
        nestedObj(this.data, this.selectedNode.path, undefined)
    }

}