import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import {createBlock} from "./Block"

export default async function Body (value, index, path, global) {
    let keyInput = textarea({class: "body", placeholder: "value", value: value})
    let Block = await createBlock(index, path, keyInput, global)

    Block.data = {
        key: "_",
        value,
        path
    }
    
    return Block
}