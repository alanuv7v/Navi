import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"
import Body from "./Body"

export default function Head (key, index, global) {
    let keyInput = input({type: "text", placeholder: "key", value: key, style: "font-size: 1.25em;"})
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
            if (event.key === "Enter") {
                global.FileList.insertBefore(Body("body", null, global), Block.nextSibling)
            }
        }
    )
    return Block
}