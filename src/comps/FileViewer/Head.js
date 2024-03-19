import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"
import Body from "./Body"
import objectToBlocks from "./objectToBlocks"

export default async function Head (key, value, index, path, dataIndex, global) {
    //create elements first so they can be referenced
    let keyInput = input({class: "head", type: "text", placeholder: "key", value: key})

    let main = []
    if (typeof value === "string") {
        if (value[0] === "@") {
            main.push(a({class: "link head", /* href="" */}, key))
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
    
    Block.key = key
    Block.value = value //later blocks will provide the value of this object anyway BUT may not, if the blocks weren't embeded. SO we put the value.
    Block.path = path

    embedButton.addEventListener('click', 
        async () => {
            let toEmbed = []
            switch (typeof value) {
                case "object":
                    toEmbed = await objectToBlocks(value, global, path)
                    break
            }
            console.log(toEmbed, path, value)
            if (toEmbed.length>0) for (let e of toEmbed.reverse()) Block.addChild(e)
            //if the value is link
            //let toEmbed = (async function () {return await import('./data/docs/Alan.yaml')})()
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