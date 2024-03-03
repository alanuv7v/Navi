import van from "vanjs-core"
import {createBlock, blockInput} from "./Block"
import Body from "./Body"
const {div, span, button, textarea, input, a, img} = van.tags

export default function Head (key, index, global) {

    let keyInput = blockInput({type: "text", placeholder: "key", value: key, 
    onkeydown: (event) => {
        console.log(event)
        if (event.key === "Enter") {
            global.FileList.insertBefore(Body("body", null, global), Block.nextSibling)
        }
    }
    })
    let special =  keyInput
    let Block = createBlock(index, special, global)
    
    return Block
}