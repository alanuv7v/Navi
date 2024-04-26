import Session from "../Session"
import { getLastTree } from "../Workers/LocalImporter"

export const session = new Session()

function openTree(tree) {
    session.tree = tree
    Presenter.renderTree(tree)
    return true
}

async function openLastTree() {
    return openTree(await getLastTree())
}

function loadLastSession () {
    openLastTree()
}

  
loadLastSession()