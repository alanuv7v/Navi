import appSession from "../appSession"
import * as Painter from "./Painter"
import Node from "../Directors/Node"

export function openTree(tree) {
    appSession.tree = tree
    Painter.renderTree(tree)
    return true
}

async function objToTree(obj) {
    new Node(key, value, null)
}