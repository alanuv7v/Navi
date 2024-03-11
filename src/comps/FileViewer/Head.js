import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"
import Body from "./Body"
import objectToBlocks from "./objectToBlocks"

export default async function Head (key, value, index, path, global) {
    //create elements first so they can be referenced
    let keyInput = input({class: "head", type: "text", placeholder: "key", value: key, })

    let main = [keyInput]
    if (typeof value === "string") main.push(input({className: "valuePreview", value: value}))
    
    let embedButton = button("embed")
    let openButton = button("open")
    main.push(embedButton, openButton)

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
            console.log(event)
            if (event.altKey && event.shiftKey && event.key==="{") {
                Block.depth(-1)
            }
            else if (event.altKey && event.shiftKey && event.key==="}") {
                Block.depth(+1)
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