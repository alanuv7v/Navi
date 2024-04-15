import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags

import * as Editor from "./Editor"

function swapIndex () {
    
}

class Block {
    //index = just for the visual and convinience
    //path = docName + key or value. needed for embed|open button onclick handler
    DOM = div({class: "Block"})
    hoverIndicators = []
    constructor (index, path, main, dataIndex) {
        if (!Array.isArray(main)) main = [main]
        //make the block to recieve inputs
    for (let e of main) {
        e.addEventListener('keydown',
        (event) => {
            if (event.altKey && event.key==="<") {
                //DOM change
                Block.parentNode.insertBefore(Block, Block.previousSibling)
                event.target.focus()
                //data change
                let prevData = global.blockDataList[Block.dataIndex]
                global.blockDataList.splice(Block.dataIndex, 1)
                Block.dataIndex -= 1
                global.blockDataList.splice(Block.dataIndex, 0, prevData)
            }
            else if (event.altKey && event.key===">") {
                //DOM change
                Block.parentNode.insertBefore(Block, Block.nextSibling.nextSibling)
                event.target.focus()
                //data change
                let prevData = global.blockDataList[Block.dataIndex]
                global.blockDataList.splice(Block.dataIndex, 1)
                Block.dataIndex += 1
                global.blockDataList.splice(Block.dataIndex, 0, prevData)
            }
        }, false)
    }
    }   

    
    
    let beforeInput = [
        index ? span({style: "margin-right: 0.5em;"}, index) : "", 
    ]
    let afterInput = [
        span({style: "flex-grow: 1"}), //spacer
    ]
    let blockInner = [...beforeInput, ...main, ...afterInput]
    for (let elem of blockInner) Block.append(elem)
    
    
    function onBlockClick(event) {
        if (global.SelectedBlock) {
            global.SelectedBlock.classList.remove("selected")
        }
        global.SelectedBlock = Block
        Block.classList.add("selected")
    }
    function onBlockAuxClick(event) {
        //show input element instead of div for key and value
    }
    Block.addEventListener('click', (event) => {onBlockClick(event)})
    Block.addEventListener('auxclick', (event) => {onBlockAuxClick(event)})
    Block.addEventListener('contextmenu', (event) => {event.stopPropagation(); event.preventDefault(); return false})
    
    Block.depth_ = 0

    Block.depth = function (add) {
        Block.depth_ = Math.max(Block.depth_ + add, 0)
        for (let i of hoverIndicators) {
            i.remove()
        }
        for (let i = 0; i < Block.depth_; i++) {
            Block.insertBefore(hoverIndicator(), blockInner.find((item) => {return item}))
        }
    }
    if (index) Block.depth(index.split(".").length)

    Block.addChild = function (child) {
        Block.parentNode.insertBefore(child, Block.nextSibling)
    }

    return Block
}