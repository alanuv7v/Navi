import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"
import Body from "./Body"

export default function Head (key, index, global) {
    let keyInput = input({class: "head", type: "text", placeholder: "key", value: key, })
    let Block = createBlock(index, keyInput, global)
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