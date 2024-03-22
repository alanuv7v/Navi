import Head from "../comps/FileViewer/Head"
import Body from "../comps/FileViewer/Body"

export default async function yamlToBlocks (yaml:String, global) {
    let blocks = []
    for (let line of yaml.split("\n")) {

    }

    return blocks
}

/* 
지금 생각해보니 이렇게 만드는 것은 별로다.
로컬 파일시스템에서 yaml 가져와서 obj로 parse해서 만드는게 낫다.
*/