import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"

export default async function Body (value, index, path, global) {
    let keyInput = textarea({class: "body", placeholder: "value", value: value})
    let Block = await createBlock(index, path, keyInput, global)

    Block.key = "_"
    Block.value = value //later blocks will provide the value of this object anyway BUT may not, if the blocks weren't embeded. SO we put the value.
    Block.path = path
    
    return Block
}