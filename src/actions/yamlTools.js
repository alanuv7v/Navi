import findChildrenBlocks from "../comps/FileViewer/findChildrenBlocks"

function getDepth (line="") {
    let depth = 0
    for (let char of line) {
        if (char===" ") {
            depth++
        } else {
            return depth
        }
    }
}

function getLineChildren (line, lineIndex, yamlLines=[]) {
    let chilren = []
    let found = false
    for (i=0; i<yamlLines.length-lineIndex; i++) {
        if (getDepth(line) + 1 === getDepth(yamlLines[i])) {
            found = true
            chilren.push(i)
        }
        else if (getDepth(line) >= getDepth(yamlLines[i])) /* found sibling or parent */ break
    }
    if (found) return chilren
    else return null
}

