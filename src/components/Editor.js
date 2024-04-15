import global from "../global/global"
import van from "vanjs-core"
const t = van.tags
const {div, span, a} = t

import Head from "./Head"
import Body from "./Body"

export const Editor = {
    DOM: div({class: "Editor window"}),
    document: {
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
    async update () {
        
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
    blocksToObject (blockDataList=[]) {
        let resultYAML = ``
        for (let row of blockDataList) {
            resultYAML += row
        }
        return resultYAML
    },
    async objectToBlocks (obj, global, originalPath=[]) {
        // param originalPath is used when a block tries to open its children.
        let blocks = []
        for (let e of Object.entries(obj)) {
            let key = e[0]
            let value = e[1]
            let path = [...originalPath, key]
            switch (key) {
                case "_":
                    blocks.push(await Body(value, null, [...originalPath, key], global))
                    break
                default:
                    let h = await Head(key, value, null, [...originalPath, key], global)
                    h.depth(path.length)
                    blocks.push(h)
                    break
    
            }
        }
        return blocks
    },
    findChildrenBlocks (Block) {
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

}

