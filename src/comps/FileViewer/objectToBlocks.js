import Head from "./Head"
import Body from "./Body"

export default async function (obj, global) {
    let blocks = []
    for (let e of Object.entries(obj)) {
        let key = e[0]
        let value = e[1]
        switch (key) {
            case "_":
                blocks.push(await Body(key, null, global))
                break
            default:
                //obj.push(Head(key, null, [global.thisDocName, key], global))
                blocks.push(await Head(key, null, [key], global))
                console.log(key, value)
                break

        }
    }

    return blocks
}