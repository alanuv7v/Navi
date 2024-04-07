export function parse (str) {
    if (typeof str != "string") throw (new Error("you should parse a string"))
    str = str.trim()
    let dataLines = []
    let rawLines = str.split("\n")
    for (let i=0; i < rawLines.length; i++) {
        let line = rawLines[i]
        let splited = line.split(":")
        dataLines[i] = {
            depth: getDepth(line),
            key: line.trimStart().split(":")[0].trim(),
            value: line.trimStart().split(":")[1].trim()
        } 
    }
    return dataLines    
}

export function getDepth (line="") {
    let depth = 0
    for (let char of line) {
        if (char===" ") {
            depth += 0.5 //if double spaces = 1 depth
        } else {
            return depth
        }
    }
}

export function getParent (lineIndex, lines=[], directOnly=true) {
    let childLine = lines[lineIndex]
    let lastParentDepthDiff = 0
    let allAncestors = []
    for (let i=lineIndex; i>=0; i--) {
        let line = lines[i]
        if (line.depth-1 === childLine.depth && directOnly) return line
        else if (childLine.depth-(lastParentDepthDiff+1) === line.depth) {
            allAncestors.push(i)
            lastParentDepthDiff++
        }
    }
    if (allAncestors.length > 0) return allAncestors 
    else {
        let err = new Error("No ancestors found for line at index(starts from 0) " + lineIndex)
        throw err
    }
}

export function getPath (docName, lineIndex, lines) {
    return getParent(lineIndex, lines, false).reverse().join("/")
}



export function getChildren (lineIndex, lines=[], directOnly=true) {
    let line = lines[lineIndex]
    let result = []
    let found = false
    for (let i=0; i<lines.length-lineIndex; i++) {
        if ((directOnly ? line.depth + 1 === lines[i].depth : line.depth < lines[i].depth) ) {
            found = true
            result.push(i)
        }
        else if (line.depth >= getDepth(lines[i])) /* found sibling or parent */ break
    }
    if (found) return result
    else return null
}

