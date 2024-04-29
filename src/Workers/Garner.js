import refs from "../Resources/DOMRefs";
import Node from "../Entities/Node"

export function createSeed(treeName, treeData) {
    return new Node(treeName, treeData, null)
}

export function plantSeedNode(seedNode) {
    refs("Editor").innerHTML = ""
    refs("Editor").append(seedNode.DOM)
}