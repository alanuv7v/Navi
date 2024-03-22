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
    let oneDepthDeeperLines = yamlLines.filter((line) => {
        return getDepth(line) === getDepth(line) + 1
    })
}

