import nestedObj from "../Workers/nestedObj"
import Node from "./Node"
import AutosaveProxy from "../Workers/AutosaveProxy"


export default class Tree {

    seed = null

    selectedNode = null

    clipboard = {
        data: new Array(20),
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
    }

    addNode(key, value) {
        const parentNode = this.selectedNode
        if (typeof parentNode != "object") {
            let originalValue = parentNode.value
            parentNode.value = {
                0: originalValue
            }
        }
        parentNode.value[key] = value
        parentNode.update()
    }

    deleteNode() {
        delete this.selectedNode.parent.value[node.key]
        node.DOM.remove()
    }

}