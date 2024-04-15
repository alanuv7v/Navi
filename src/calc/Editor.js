import global from "../global/global"
import van from "vanjs-core"
const t = van.tags
const {div, span, a} = t

import Head from "../io/Head"
import Body from "../io/Body"

import parseQuery from "./global/utils"
import * as yaml from 'yaml'
import nestedObj from "../libs/nestedObj"

export default Editor = {
    docuemnt: {
        handle: null,
        original: {
            raw: null,
            parsed: null,
        },
        edited: {
            raw: null,
            parsed: null,
        }
    },
    blocks: [],
    update: async () => {

        this.document.obj = await yaml.parse(this.document.original)
        this.document.edited = this.document.original
        this.document.editedRaw = this.document.original.split("\n")
        global.DOM.YAMLPreview.DOM.value = this.document.original

        //Empty the pre-existing Editor
        this.DOM.innerHTML = ""
        //Add Title
        function addTitle () {
            this.DOM.append(
                div({class: "h-flex Block", style: "margin-bottom: 0px;"},
                    div({class: "title"}, this.document.name),
                    div({class: "h-flex"}, span("["),a("edit"), span("]"))
                )
            )
        }
        
        this.blocks = await objectToBlocks(this.document.obj, /* this.document.editedRaw, */ global)
        for (let block of this.blocks) {
            global.Editor.append(block)
        }
    },
    blocksToObject: (blockDataList=[]) => {
        let resultYAML = ``
        for (let row of blockDataList) {
            resultYAML += row
        }
        return resultYAML
    },
    objectToBlocks: async (obj, global, originalPath=[]) => {
        // param originalPath is used when a block tries to open its children.
        let result = []
        for (let e of Object.entries(obj)) {
            let key = e[0]
            let value = e[1]
            let path = [...originalPath, key]
            switch (key) {
                case "_":
                    result.push(await Body(value, null, [...originalPath, key], global))
                    break
                default:
                    let h = await Head(key, value, null, [...originalPath, key], global)
                    h.depth(path.length)
                    result.push(h)
                    break
    
            }
        }
        return result
    },
    findChildrenBlocks: (Block) => {
        //nextSibling 이용하는걸로 바꾸자
        let children = []
        for (let i=0; i<blocks.length; i++) {
            if (!(blocks[i].depth_ > Block.depth_+1))  {
                return children
            }
            children.push(blocks[i])
        }
        return children
    },
    createMirrorLink: async (from, to, tie, docs, mirrorLinkKey) => {
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
}

