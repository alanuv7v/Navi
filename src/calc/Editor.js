import global from "../global/global"
import van from "vanjs-core"
const t = van.tags
const {div, span, a} = t

import Head from "../io/Head"
import Body from "../io/Body"

import * as yaml from 'yaml'
import { nestedObj, parseQuery } from "./global/utils"
import { pureFileName } from "./global/utils"

export const document = {
    handle: null,
    name: null,
    original: {
        raw: null,
        parsed: null,
    },
    edited: {
        raw: null,
        parsed: null,
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
    
    blocks = await objectToBlocks(document.obj, /* document.editedRaw, */ global)
    for (let block of blocks) {
        global.Editor.append(block)
    }
    
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
export const createMirrorLink = async (from, to, tie, docs, mirrorLinkKey) => {
    let targetQueryResult =  await parseQuery(to, docs)
    let {obj, path, handle} = targetQueryResult
    console.log(`creating mirror link, 
    from [${from}] 
    to [${to}], 
    tie: ${tie}. 
    success: `, targetQueryResult)
    if (obj && path) { 
        nestedObj(obj, [...path.slice(1), tie], from, null, true)
        let targetNewRaw = await yaml.stringify(obj)
        let targetWritable = (await handle.createWritable())
        targetWritable.write(targetNewRaw).then(() => {
            targetWritable.close()
        })
        return targetNewRaw
    } else {
        return false
    }
}

