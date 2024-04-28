import refs from "../Resources/DOMRefs";
import Node from "../Entities/Node";

export function renderTree(treeData) {
    console.log(treeData)
    refs("Editor").append(
        new Node('asfd', treeData, null).DOM
    )
}