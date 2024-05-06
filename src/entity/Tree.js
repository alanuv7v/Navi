export default class Tree {

    seed = null

    selectedNode = null

    clipboard = {
        data: new Array(20),
        get lastItem () {
            return this.data[this.data.length-1]
        }
    }

    copyNode(node) {
        this.clipboard.data.push(structuredClone(node))
    }

    pasteNode(node) {
        if (typeof node.value != "Object") return false
        const childNode = this.clipboard.lastItem
        node.addChild(childNode.key, childNode.value)
    }

}