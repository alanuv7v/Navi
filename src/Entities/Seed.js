import refs from "../Resources/DOMRefs";
import Node from "../Entities/Node"
import Tree from "./Tree";

export default class Seed {
    constructor (document, treeData) {
        this.document = document
        this.treeData = treeData
    }
    
    node = new Node(document.name, this.treeData, undefined)

    sprout () {
        refs("Editor").innerHTML = ""
        refs("Editor").append(seedNode.DOM)
        return new Tree(this.treeData)
    }
    
}

