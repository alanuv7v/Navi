import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags

export function createBlock (index, input, global) {

    let hoverIndicators = []
    let hoverIndicator = () => {
        let s = span({class: "hoverIndicator", style: "width: 0.5em;"})
        hoverIndicators.push(s)    
        return s
    }
    input.addEventListener('keydown',
    (event) => {
        if (event.altKey && event.shiftKey && event.key==="_") {
            Block.parentNode.insertBefore(Block, Block.previousSibling)
            event.target.focus()
        }
        else if (event.altKey && event.shiftKey && event.key==="+") {
            Block.parentNode.insertBefore(Block, Block.nextSibling.nextSibling)
            event.target.focus()
        }
    }, false)
    
    let beforeInput = [
        index ? span({style: "margin-right: 0.5em;"}, index) : null, 
    ]
    let afterInput = [
        span({style: "width: 1em"}), //spacer
        button("expand"),
        button("open")
    ]
    let blockInner = [...beforeInput, input, ...afterInput]
    let Block = div({class: "Block"}, blockInner)

    function onBlockClick(event) {
        global.SelectedBlock = Block
        console.log(global.SelectedBlock)
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

    return Block
}