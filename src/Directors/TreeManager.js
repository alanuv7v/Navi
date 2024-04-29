import appSession from "../Resources/appSession"
import * as Painter from "../Workers/Painter"
import Node from "../Entities/Node"

export function openTree(treeName, treeData) {
    Painter.renderTree(treeName, treeData)
    return true
}

async function objToTree(obj) {
    new Node(key, value, null)
}