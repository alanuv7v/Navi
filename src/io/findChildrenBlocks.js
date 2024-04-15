export default function (Block) {
    let children = []
    for (let i=0; i<blocks.length; i++) {
        if (!(blocks[i].depth_ > Block.depth_+1))  {
            return children
        }
        children.push(blocks[i])
    }
    return children
}

//nextSibling 이용하는걸로 바꾸자