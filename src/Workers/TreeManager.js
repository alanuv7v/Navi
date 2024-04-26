import appSession from "../appSession"
import * as Painter from "./Painter"

export function openTree(tree) {
    appSession.tree = tree
    Painter.renderTree(tree)
    return true
}