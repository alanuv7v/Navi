import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"
import Body from "./Body"
import objectToBlocks from "./objectToBlocks"
import pureFilename from "../libs/pureFilename"
import * as yaml from 'yaml'
import findChildrenBlocks from "./findChildrenBlocks"


export default async function Head (key, value, index, path, /* dataIndex, */ global) {
    //create elements first so they can be referenced
    let keyInput = input({class: "head", type: "text", placeholder: "key", value: key})

    let main = []
    if (typeof value === "string") {
        if (value === "@") {
            main.push(input({class: "link head", value: key}))
        }
        else {
            main.push(keyInput)
            main.push(input({class: "valuePreview", value: value}))
        }
    } else {
        main.push(keyInput)
    }
    
    let embedButton = button("embed")
    let openButton = button("open")
    main.push(div({class: "options"}, [embedButton, openButton]))

    let Block = await createBlock(index, path, main, global)
    
    Block.rawData = {
        key,
        value
    }
    
    Block.embeded = false

    embedButton.addEventListener('click', 
        async () => {
            if (Block.embeded) {
                let childrenBlocks = findChildrenBlocks(Block)
                for (let c of childrenBlocks) c.remove()
                Block.rawData.value = value
                Block.embeded = false
                return
            }
            Block.embeded = true
            let toEmbed = []
            if (value === "@") {
                Block.rawData.value = {}
                let linkFile = await global.docs.find((i) => {return pureFilename(i.name) === key}).handle.getFile()
                let linkRaw = await linkFile.text()
                let linkParsed = await yaml.parse(linkRaw)
                toEmbed = await objectToBlocks(linkParsed, global, path)
                console.log(toEmbed, path, value)
                if (toEmbed.length>0) for (let e of toEmbed.reverse()) Block.addChild(e)
            } else {
                switch (typeof value) {
                    case "object":
                        toEmbed = await objectToBlocks(value, global, path)
                        console.log(toEmbed, path, value)
                        if (toEmbed.length>0) for (let e of toEmbed.reverse()) Block.addChild(e)
                        break
                }
            }
        }
    )

    openButton.addEventListener('click', 
        async () => {
            if (value === "@") {
                global.openDoc(global.docs.find((i) => {return pureFilename(i.name) === key}).handle)
            } else {
                switch (typeof value) {
                    case "object":
                        break
                }
            }
        }
    )
    
    keyInput.addEventListener('keydown', 
        (event) => {
            console.log(event.key)
            if (event.altKey && event.key===",") {
                Block.depth(-1)
            }
            else if (event.altKey && event.key===".") {
                Block.depth(+1)
            }
            else if (event.altKey && event.ctrlKey && event.key==="}") {
            }
            else if (event.altKey && event.ctrlKey && event.key==="}") {
            }
            else if (event.key === "Enter") {
                if (event.shiftKey) {
                    global.FileList.insertBefore(Body("body", null, global), Block.nextSibling)
                }
                else {
                    let newBlock = Head("Item", null, global)
                    newBlock.depth(Math.max(1, Block.depth_))
                    global.FileList.insertBefore(newBlock, Block.nextSibling)
                }
            }
        }
    )
    return Block
}