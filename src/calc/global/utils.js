import { parse } from "yaml"

export function nestedObj (obj, props, value, command=false, createNesting=false) {
    if (!props) return obj;
    if (props.length === 0) return obj
    let prop = props[0]
    let maxDig = value ? props.length-1 : props.length
    for (let i = 0; i < maxDig; i++) {
      prop = props[i]
      if (!obj[prop] && createNesting) {
        obj[prop] = {}
      }
      obj = obj[prop]
      /* 
      let candidate = obj[prop]
      if (candidate !== undefined) {
        obj = candidate
      } else {
        break
      } */
    }
    if (value) {
        obj[prop] = value
        return obj
    }
    switch (command) {
        case "delete":
            delete obj[prop]
            return
        default: 
            break
    }
    return obj
}

//nestObj 사용 예시:
/* var obj = {
    foo: {
        bar: {
        baz: 'x'
        }
    }
};

nestedObj(obj, ["foo", "bar", "baz"], 'y'); */

export function pureFileName (str) {
    return str.slice(0, str.lastIndexOf("."))
}

export async function parseQuery (str, docs) {
    try {
        let path = str.split("/")
        let targetDoc = docs.find((doc) => pureFileName(doc.name) === path[0])
        let file = await targetDoc.handle.getFile()
        let raw = await file.text()
        return {obj: await parse(raw),
            path, 
            handle: targetDoc.handle}
    } catch (err) {
        return err
    }
}

export async function listAllFilesAndDirs(dirHandle) {
    const files = [];
    for await (let [name, handle] of dirHandle) {
        const {kind} = handle;
        if (handle.kind === 'directory') {
            files.push({name, handle, kind, children: await listAllFilesAndDirs(handle)});
        } else {
            files.push({name, handle, kind});
        }
    }
    return files;
}