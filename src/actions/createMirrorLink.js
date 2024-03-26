import parseQuery from "./parseQuery"
import * as yaml from 'yaml'
import nestedObj from "../libs/nestedObj"


export default async function (from, to, tie, docs, mirrorLinkKey) {
    let {obj, path, handle} = parseQuery(to, docs)
    console.log(from, to, tie, parseQuery(to, docs))
    if (obj && path) {
        let targetParsed = await yaml.parse(obj)
        nestedObj(targetParsed, [...path, tie], from)
        let targetNewRaw = await yaml.stringify(targetParsed)
        let targetWritable = (await handle.createWritable())
        targetWritable.write(targetNewRaw).then(() => {
            targetWritable.close()
        })
        return targetNewRaw
    } else {
        return false
    }
}