import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"

export default function Body (value, index, global) {
    let keyInput = textarea({class: "body", placeholder: "value", value: value})
    let Block = createBlock(index, keyInput, global)
    
    return Block
}