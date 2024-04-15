import global from "../global/global"
import van from "vanjs-core"
const t = van.tags
const {div, span, a} = t

import Head from "../io/Head"
import Body from "../io/Body"

import * as yaml from 'yaml'
import { nestedObj, parseQuery } from "./global/utils"
import { pureFileName } from "./global/utils"

import { log } from "./Logs"

export const document = {
    handle: null,
    name: null,
    original: {
        raw: null,
        parsed: null,
        links: [],
    },
    edited: {
        raw: null,
        parsed: null,
        links: [],
    }
}
export const blocks = []
export const open = async (handle) => {

    if (!(await handle.queryPermission()) === "granted") {
        await handle.requestPermission()
    } 
    let docFile = await handle.getFile()
    let docRaw = await docFile.text()
    document.name = pureFileName(handle.name)
    document.original.raw = docRaw
    document.original.parsed = yaml.parse(docRaw)
    document.edited.raw = document.original.raw
    document.edited.parsed = document.original.parsed

    global.DOM.RawEditor.value = document.original.raw

    //Empty the pre-existing Editor
    global.DOM.Editor.innerHTML = ""
    //Add Title
    function addTitle () {
        global.DOM.Editor.append(
            div({class: "h-flex Block", style: "margin-bottom: 0px;"},
                div({class: "title"}, document.name),
                div({class: "h-flex"}, span("["),a("edit"), span("]"))
            )
        )
    }
    addTitle()
    
    /* blocks = await objectToBlocks()
    for (let block of blocks) {
        global.Editor.append(block)
    }
     */
    log(`Successfully opened the document [${document.name}]`)
}

export const blocksToObject = (blockDataList=[]) => {
    let resultYAML = ``
    for (let row of blockDataList) {
        resultYAML += row
    }
    return resultYAML
}

export const objectToBlocks = async (obj, originalPath=[]) => {
    // param originalPath is used when a block tries to open its children.
    let result = []
    for (let e of Object.entries(obj)) {
        let key = e[0]
        let value = e[1]
        let path = [...originalPath, key]
        switch (key) {
            case "_":
                result.push(await Body(value, null, [...originalPath, key]))
                break
            default:
                let h = await Head(key, value, null, [...originalPath, key])
                h.depth(path.length)
                result.push(h)
                break

        }
    }
    return result
}
export const findChildrenBlocks = (Block) => {
    //nextSibling 이용하는걸로 바꾸자
    let children = []
    for (let i=0; i<blocks.length; i++) {
        if (!(blocks[i].depth_ > Block.depth_+1))  {
            return children
        }
        children.push(blocks[i])
    }
    return children
}
export async function createMirrorLink (from, to, tie, mirrorLinkKey) {
    let targetQueryResult =  await parseQuery(to, global.docs)
    let {obj, path, handle} = targetQueryResult
    if (obj && path) { 
        nestedObj(obj, [...path.slice(1), "%"+tie], from, null, true)
        let targetNewRaw = await yaml.stringify(obj)
        let targetWritable = (await handle.createWritable())
        targetWritable.write(targetNewRaw).then(() => {
            targetWritable.close()
        })
        console.log(`created mirror link, 
        from [${from}] 
        to [${to}] 
        tie: ${tie}
        target found: ${targetQueryResult}
        res: `, targetNewRaw)
        return targetNewRaw
    } else {
        return false
    }
}
export async function deleteProperty (pathQuery) {
    let targetQueryResult =  await parseQuery(pathQuery, global.docs)
    let {obj, path, handle} = targetQueryResult
    if (obj && path) { 
        nestedObj(obj, path, null, "delete")
        let targetNewRaw = await yaml.stringify(obj)
        let targetWritable = (await handle.createWritable())
        targetWritable.write(targetNewRaw).then(() => {
            targetWritable.close()
        })
        console.log(`deleted property,
        from: [${from}] 
        path: ${path}
        target found: ${targetQueryResult}
        res: `, targetNewRaw)
        return targetNewRaw
    } else {
        return false
    }
}

