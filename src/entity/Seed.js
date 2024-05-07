import refs from "../resource/DOMRefs";
import nestedObj from "../tech/nestedObj";
import Node from "./Node"
import Query from "./Query";
import Tree from "./Tree";
import * as yaml from "yaml"

export default class Seed {
    
    constructor (pathString) {
        this.pathString = pathString
        this.query = new Query(pathString)
    }
    
    async parse () {
        let {document, treeData} = await this.query.parse()
        this.document = document
        this.treeData = treeData
    }
    
    node = null

    plant () {
        this.node = new Node(this.document.name, this.treeData, undefined)
        refs("Editor").innerHTML = ""
        refs("Editor").append(this.node.DOM)
        return new Tree(this.treeData)
    }

    async stringify () {
        if (!this.document) return false
        let originalDocumentTreeData = (await this.document.parse()).parsed
        let seedTreeData = this.node.value
        let fullTreeData = structuredClone(originalDocumentTreeData)
        nestedObj(fullTreeData, this.query.props, seedTreeData)
        return yaml.stringify(fullTreeData)
    }
    
}

