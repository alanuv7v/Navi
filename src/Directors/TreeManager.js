import appSession from "../appSession"
import * as Painter from "../Workers/Painter"
import Node from "../Entities/Node"

export function openTree(treeData) {
    Painter.renderTree(treeData)
    return true
}

async function objToTree(obj) {
    new Node(key, value, null)
}