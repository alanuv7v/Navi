import appSession from "../appSession"

export function openTree(tree) {
    appSession.tree = tree
    Presenter.renderTree(tree)
    return true
}