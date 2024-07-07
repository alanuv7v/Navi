//Actions that are not directly excuted by user commands, but expected to be excuted automatically by certain ques.
import appSession from "../resource/appSession"
import van from "vanjs-core";
import refs from "../resource/DOMRefs";

const {div} = van.tags


let originIndicators = []

export function updateOriginIndicators () {

    function getElemCenter (elem) {
        return {
            left: elem.offsetLeft + (elem.offsetWidth/2),
            top: elem.offsetTop + (elem.offsetHeight/2)
        }
    }

    function createOriginIndicator (origin, branch, thickness=4) {

        let originCenter = getElemCenter(origin.DOM.querySelector(".linksOpener"))
        let branchCenter = getElemCenter(branch.DOM.querySelector(".linksOpener"))
    
        return div({style: `
            position: absolute;
            left: ${(originCenter.left - (thickness/2)) + "px"};
            top: ${originCenter.top + "px"};
            width: ${(branchCenter.left - originCenter.left) + "px"};
            height: ${(branchCenter.top - originCenter.top + (thickness/2)) + "px"};
        `, class: "originIndicator"})
    }

    function getFromStack (start, length=20) {
        let stack = []
        let lastFrom = start
        for (let i = 0; i < length; i++) {
            if (!lastFrom?.openedFrom) break
            stack.push({
                origin: lastFrom.openedFrom,
                branch: lastFrom
            })
            lastFrom = lastFrom.openedFrom
        }
        return stack
    }

    let maxOriginIndicators = 10
    let selectedNodeView = appSession.selectedNode

    let newIndicatorStack = getFromStack(selectedNodeView, maxOriginIndicators)
    let diffRemaningStack = originIndicators.filter(i => newIndicatorStack.find(ii => i.origin.id === ii.origin.id && i.branch.id === ii.branch.id)) || []
    let diffOldStack = originIndicators.filter(i => diffRemaningStack.indexOf(i) < 0) || []
    let diffNewStack = newIndicatorStack.filter(i => !diffRemaningStack.find(ii => i.origin.id === ii.origin.id && i.branch.id === ii.branch.id))

    diffOldStack.forEach(d => d.indicator.remove())

    diffNewStack.forEach(d => {
        d.indicator = createOriginIndicator(d.origin, d.branch)
        refs("Editor").querySelector(".overlay").append(d.indicator)
    })

    originIndicators = [...diffRemaningStack, ...diffNewStack]
       
}