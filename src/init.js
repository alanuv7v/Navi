import { openTree } from "./Directors/TreeManager"
import { getLastTreeData } from "./Directors/LocalDBManager"

async function openLastTree() {
    let lastTreeData = await getLastTreeData()
    if (lastTreeData) return openTree(lastTreeData)
    else return openTree({})
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


