import nestedObj from "../../libs/nestedObj"

export default function (blocks=[]) {
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