import nestedObj from "../libs/nestedObj"
import * as yaml from 'yaml'


//blockData = {key, value, path}

/* export default function (blocks=[]) {
    const result = {}
    let blocksPerDepth = []
    let lastPath = []
    for (let block of blocks) {
        //해당 block의 depth보다 1 적은 depth를 가진 가장 최신 block의 path에 꽂는다
        let parentBlock = blocks.findLast((b) => {return b.depth === block.depth-1})
        if (parentBlock) nestedObj(result, [...parentBlock.path, block.key], block.value)
        else nestedObj(result, [block.key], block.value)
    }
    //if block has 2 more depth than lastHead, it's invalid. 
    //but I'm not even assumung that such input will be given to this function
}

 */


//미친 획기적인 발상! 아예 YAML의 행 자체를 움직이면 어떨까?
//그렇게나 직관적이면서 심플한, YAML과 동기화된 방법이라니. 단순무식하면서 쾌활하다. 
/* 
export default function (blocks=[]) {
    let resultYAML = ``
    for (let block of blocks) {
        let row = ""
        if (typeof block.value === "object") {
            let v = ""
            v += yaml.stringify(block.value).trimEnd()
            let vv = v.split("\n")
            for (let i=0; i<vv.length; i++) {
                let append = []
                for (let i=0; i<block.depth_; i++) append.push("  ")
                vv[i] = append + vv[i]
            }
            v = vv.join("\n")
            row = block.key + ":" +"\n" + v
        } else {
            row = block.key + ": " + block.value
        }
        row += "\n"
        resultYAML += row
    }
    return resultYAML
} */

//아니야 이것보다 더 단순해야 돼.
//애초에 depth+ 버튼을 누를때 Block element의 data(스트링) 맨 앞에 공백 두개가 추가되야 해.
//이 함수는 그저 모든 block들의 data들을 .join("\n")해주기만 하는 극히 단순한 함수어야 한다.

/* 
완전히 다르게 생각해보자.
애초에 App.js에서 Object를 가져오지 않는다.
그냥 YAML을 string으로 가져오자.
한줄씩 잘라서 Block화한다. indent가 안된 줄들(즉 최상위 key들)만.
그 밑에 해당 Block보다 1번 더 indent된 줄들도 embed 되기도 전에 blockDataList에 넣는다. 다만 얘네는 렌더되지 않는다! 최상위가 아닌 것들은 숨겨진다. blockDataList에 들어갈 뿐 Block으로 시각화되어 DOM에 추가되지 않는다.

결국 embed 버튼을 눌렀든 말든 blockDataList는 YAML의 모든 행을 저장하고 있다.

Block은 blockData의 index를 저장하고 있다. (Block.dataIndex)
Block에서 depth+-를 하면 
1. Block의 순서가 DOM에서 바뀌고
2. global.blockDataList[Block.dataIndex]의 순서가 바뀐다. 그에 따라 Block.dataIndex도 새 index로 바뀐다.

*/

export default function (blockDataList=[]) {
    let resultYAML = ``
    for (let row of blockDataList) {
        resultYAML += row
    }
    return resultYAML
}
//끝!