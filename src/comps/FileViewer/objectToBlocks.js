//Simply returns Blocks containing the 1 depth deeper key & value sets

import Head from "./Head"
import Body from "./Body"

export default async function (obj, raw, global, originalPath=[]) {
    // param originalPath is used when a block tries to open its children.
    let blocks = []
    for (let e of Object.entries(obj)) {
        let key = e[0]
        let value = e[1]
        let path = [...originalPath, key]
        switch (key) {
            case "_":
                blocks.push(await Body(value, null, [...originalPath, key], global))
                break
            default:
                //obj.push(Head(key, null, [global.thisDocName, key], global))
                let h = await Head(key, value, null, [...originalPath, key], global)
                h.depth(path.length)
                blocks.push(h)
                console.log(key, value)
                break

        }
    }

    return blocks
}