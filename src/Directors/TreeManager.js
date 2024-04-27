import appSession from "../appSession"
import * as Painter from "../Workers/Painter"
import Node from "../Entities/Node"

export function openTree(tree) {
    Painter.renderTree(tree)
    return true
}

async function objToTree(obj) {
    new Node(key, value, null)
}