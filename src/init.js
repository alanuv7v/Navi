import { openTree } from "./Workers/TreeManager"
import { getLastTreeData } from "./Workers/LocalDBManager"

async function openLastTree() {
    return openTree(await getLastTreeData())
}

function loadLastSession () {
    try {
        openLastTree ()
    } catch {
        console.log("Could not load last session. The last session data is corrupted or does not exist.")
    }
}

  
export default function init () {
    import("./Resources/DB")
        .then(obj => loadLastSession())
}


