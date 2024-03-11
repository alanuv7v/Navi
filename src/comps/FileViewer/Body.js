import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"

export default async function Body (value, index, global) {
    let keyInput = textarea({class: "body", placeholder: "value", value: value})
    let Block = await createBlock(index, null, keyInput, global)
    
    return Block
}