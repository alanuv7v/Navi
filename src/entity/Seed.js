import refs from "../resource/DOMRefs";
import Node from "./Node"
import Tree from "./Tree";

export default class Seed {
    constructor (document, treeData) {
        this.document = document
        this.treeData = treeData
    }
    
    node = null

    grow () {
        this.node = new Node(this.document.name, this.treeData, undefined)
        refs("Editor").innerHTML = ""
        refs("Editor").append(this.node.DOM)
        return new Tree(this.treeData)
    }
    
}

