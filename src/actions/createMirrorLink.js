import parseQuery from "./parseQuery"
import * as yaml from 'yaml'
import nestedObj from "../libs/nestedObj"


export default async function (from, to, tie, docs, mirrorLinkKey) {
    let {obj, path, handle} = await parseQuery(to, docs)
    console.log(`creating mirror link, from ${from} to ${to}, tie: ${tie}. success: `, parseQuery(to, docs))
    if (obj && path) {
        console.log({obj, path, handle, pathhh: [...path.slice(1), tie]})
        nestedObj(obj, [...path.slice(1), tie], from, null, true)
        let targetNewRaw = await yaml.stringify(obj)
        let targetWritable = (await handle.createWritable())
        targetWritable.write(targetNewRaw).then(() => {
            targetWritable.close()
        })
        return targetNewRaw
    } else {
        return false
    }
}