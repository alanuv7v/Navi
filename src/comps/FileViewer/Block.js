import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

export default function (key, value, index, global) {

    let depth = 1

    let hoverIndicators = []
    let hoverIndicator = () => {
        let s = span({class: "hoverIndicator", style: "width: 0.5em;"})
        hoverIndicators.push(s)    
        return s
    }
    

    let blockInner = [
        index ? span({style: "margin-right: 0.5em;"}, index) : null, 
        input({type: "text", value: key}),
        value ? input({type: "text", style: "margin-left: 10px;", value: value}) : null,
    ]
    let Block = div({class: "Block"},
        hoverIndicator(),
        blockInner,    
    )
    function onBlockClick(event) {
        global.SelectedBlock = Block
        console.log(global.SelectedBlock)
    }
    Block.addEventListener('click', (event) => {onBlockClick(event)})
    
    Block.depth = function (add) {
        depth = Math.max(depth + add, 0)
        for (let i of hoverIndicators) {
            i.remove()
        }
        for (let i = 0; i < depth; i++) {
            Block.insertBefore(hoverIndicator(), blockInner.find((item) => {return item}))
        }
    }
    

    return Block
}