import { parse } from "yaml"
import pureFilename from "../libs/pureFilename"

export default async function (str, docs) {
    try {
        let path = str.split("/")
        let targetDoc = docs.find((doc) => pureFilename(doc.name) === path[0])
        let file = await targetDoc.handle.getFile()
        let raw = await file.text()
        return {obj: await parse(raw),
            path, 
            handle: targetDoc.handle}
    } catch (err) {
        console.log(err)
        return false
    }
}