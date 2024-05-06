import refs from "../resource/DOMRefs";
import Node from "./Node"
import Tree from "./Tree";
import * as yaml from "yaml"

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

    async stringify () {
        let seedDocumentValue = structuredClone(this.node.value)
        for (let [key, value] of seedDocumentValue) {
            if ()
        }
        return await yaml.stringify(this.node.value)
    }
    
}

