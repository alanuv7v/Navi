import refs from "../Resources/DOMRefs";
import Node from "../Entities/Node";

export function renderTree(treeData) {
    refs("Editor").append(
        new Node('asfd', treeData, null).DOM
    )
}