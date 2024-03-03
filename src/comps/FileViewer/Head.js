import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock, blockInput} from "./Block"
import Body from "./Body"

export default function Head (key, index, global) {
    let keyInput = blockInput(input({type: "text", placeholder: "key", value: key}))
    let special =  keyInput
    let Block = createBlock(index, special, global)
    keyInput.addEventListener('keydown', 
        (event) => {
            console.log(event)
            if (event.key === "Enter") {
                global.FileList.insertBefore(Body("body", null, global), Block.nextSibling)
            }
        }
    )
    return Block
}