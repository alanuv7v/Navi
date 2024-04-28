import nestedObj from "../Workers/nestedObj"
import Node from "./Node"
import AutosaveProxy from "../Workers/AutosaveProxy"


export default class Tree {
    
    data = AutosaveProxy({})

    constructor (data) {
        this.data = data
    }

    selectedNode = null

    clipboard = {
        data: [],
        get lastItem () {
            return this.data[this.data.length-1]
        }
    }

    copyNode() {
        this.clipboard.data.push(structuredClone(this.selectedNode))
    }

    pasteNode() {
        const parentNode = this.selectedNode
        if (typeof parentNode.value === "Object") return false
        const childNode = this.clipboard.lastItem
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