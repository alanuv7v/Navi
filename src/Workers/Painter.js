import refs from "../Resources/DOMRefs";
import Node from "../Entities/Node";

export function renderTree(treeName, treeData) {
    console.log(treeData)
    refs("Editor").append(
        new Node(treeName, treeData, null).DOM
    )
}