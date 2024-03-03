import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a, img} = t
const d = div

export default function createBlock (key, value, index, global) {

    let depth = index ? index.split(".").length : 0

    let hoverIndicators = []
    let hoverIndicator = () => {
        let s = span({class: "hoverIndicator", style: "width: 0.5em;"})
        hoverIndicators.push(s)    
        return s
    }

    let blockInput = (props) => {
        let e = input({...props})
        e.addEventListener('keydown',
        (event) => {
            console.log(event.key)

            if (event.altKey && event.shiftKey && event.key==="{") {
                Block.depth(-1)
            }
            else if (event.altKey && event.shiftKey && event.key==="}") {
                Block.depth(+1)
            }
            else if (event.altKey && event.shiftKey && event.key==="_") {
                Block.parentNode.insertBefore(Block, Block.previousSibling)
                event.target.focus()
            }
            else if (event.altKey && event.shiftKey && event.key==="+") {
                Block.parentNode.insertBefore(Block, Block.nextSibling.nextSibling)
                event.target.focus()
            }
        }, false)
        return e
    }
    
    let keyInput = key ? blockInput({type: "text", placeholder: "key", value: key, 
    onkeydown: (event) => {
        console.log(event)
        if (event.key === "Enter") {
            global.FileList.insertBefore(createBlock(null, "body", null, global), Block.nextSibling)
        }
    }
    }) : null

    let valueInput = value ? textarea({placeholder: "value", value: value}) : null

    let blockInner = [
        index ? span({style: "margin-right: 0.5em;"}, index) : null, 
        keyInput,
        valueInput,
        span({style: "width: 1em"}),
        button("expand"),
        button("open")
    ]
    let Block = div({class: "Block"},
        blockInner,
    )
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
    
    Block.depth = function (add) {
        depth = Math.max(depth + add, 0)
        for (let i of hoverIndicators) {
            i.remove()
        }
        for (let i = 0; i < depth; i++) {
            Block.insertBefore(hoverIndicator(), blockInner.find((item) => {return item}))
        }
    }
    Block.depth(depth)

    return Block
}