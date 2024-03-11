import van from "vanjs-core"
const {div, span, button, textarea, input, a, img} = van.tags
import nestedObj from "../../libs/nestedObj"
import objectToBlocks from "./objectToBlocks"

import Head from "./Head"
import Body from "./Body"
import * as docs from "../../docs"
import embedPNG from '../../icons/embed.png'
import expandPNG from '../../icons/expand.png'
import outerPNG from '../../icons/outer.png'


function addChild (parent, child) {
    parent.parentNode.insertBefore(child, parent.nextSibling)
}

export async function createBlock (index, path, input, global) {
    //index = just for the visual and convinience
    //path = docName + key or value. needed for embed|open button onclick handler
    
    let value
    if (path) value = nestedObj(await global.thisDoc, [...path])
    

    let Block = div({class: "Block"})

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
        index ? span({style: "margin-right: 0.5em;"}, index) : "", 
    ]
    let afterInput = [
        span({style: "width: 1em"}), //spacer
        button({onclick: async () => {
            let toEmbed = []
            switch (typeof value) {
                case "object":
                    toEmbed = await objectToBlocks(value, global)
                    break
            }
            console.log(toEmbed, path, value)
            if (toEmbed.length>0) for (let e of toEmbed.reverse()) addChild(Block, e)
            //if the value is link
            //let toEmbed = (async function () {return await import('./data/docs/Alan.yaml')})()
        }}, "embed"), 
        button("open"),
        /* button(img({src: embedPNG, class: "icon", style: "filter: invert(1.0)"})), 
        button(img({src: outerPNG,  class: "icon", style: "filter: invert(1.0)"})), */
    ]
    let blockInner = [...beforeInput, input, ...afterInput]
    for (let elem of blockInner) Block.append(elem)
    

    function onBlockClick(event) {
        global.SelectedBlock = Block
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