import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock, blockInput} from "./Block"

export default function Body (value, index, global) {

    let keyInput = blockInput(textarea({placeholder: "value", value: value}))
    let special =  keyInput
    let Block = createBlock(index, special, global)
    
    return Block
}