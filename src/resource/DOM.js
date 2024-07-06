import appSession from "./appSession";
import van from "vanjs-core";

import * as userActions from "../natural/userActions"
import refs from "./DOMRefs";
import CommandsTree from "../entity/view/CommandTree";
import Logger from "../tech/gui/Logger";

const tagsToUse = "div button input".split(" ")
const tag = {}

tagsToUse.forEach(t => {
    tag[t] = (id, props, ...children) => van.tags[t]({id: id, ...props}, children)
})

const {div, button, input} = tag

export default div("App", {
        style: "font-size: 16px;"
    },
    div("Header", {class: ""}, 
        div("QuickActions", {}, 
            button("PickRoot", {
                onclick: () => {
                    new CommandsTree(userActions.Root, false)
                }, 
                tooltip: "Root actions"
            }, "木 "),
            button("History", {
                tooltip: "History"
            }, "↹"),
            button("GoBack", {
                tooltip: "Go Back"
            }, "◁"),
            button("GoForth", {
                tooltip: "Go Forth"
            }, "▷"),
            button("ToOrigin", {
                tooltip: "Go to origin"
            }, "⇑"),
            button("ToLinks", {
                tooltip: "Go to links"
            }, "⇓"),
            button("Path", {
                tooltip: "View trace"
            }, "//"),
            button("Adress", {
                tooltip: "View origins from root"
            }, ">>"),
            button("Debugger", {
                tooltip: "Debugger",
                onclick: () => {
                    let t = van.tags.textarea()
                    refs("Editor").append(t)
                    t.addEventListener("change", (event) => {
                        let res = JSON.stringify((new Function(`return ${event.target.value}`))(), null, 2)
                        Logger.log(res)
                    })    
                }
            }, "<>"),
            //button("RegrowTree", {}, "⟳"),
            input("GoTo", {
                onchange: (event) => {
                    userActions.Navigate.show_node_(event.target.value)
                }, 
                tooltip: "Go to"
            }),
            input("Filter", {    
                tooltip: "Filter",
                type: "text", placeholder: "filter", value: "*"
            }),
        ),
        div("Commands", {},
            div("Logs"),
        ),
    ),
    div("Main", {}, 
        div("View", {class: ""}, 
            div("Editor", {onclick: (event) => onEditorScroll(event)}, 
                div("Nodes"),
                div("", {class: "overlay"})
            )
        ),
    ),
    div("Footer", {class: ""},
        input("CommandPalette"),
        div("States"),
        Logger.DOM
    ),
)

let originIndicators = []

function onEditorScroll (event) {

    function getElemCenter (elem) {
        return {
            left: elem.offsetLeft + (elem.offsetWidth/2),
            top: elem.offsetTop + (elem.offsetHeight/2)
        }
    }

    function createOriginIndicator (origin, branch, thickness=4) {

        let originCenter = getElemCenter(origin.DOM.querySelector(".linksOpener"))
        let branchCenter = getElemCenter(branch.DOM.querySelector(".linksOpener"))
    
        return van.tags.div({style: `
            position: absolute;
            left: ${(originCenter.left - (thickness/2)) + "px"};
            top: ${originCenter.top + "px"};
            width: ${(branchCenter.left - originCenter.left) + "px"};
            height: ${(branchCenter.top - originCenter.top + (thickness/2)) + "px"};
        `, class: "originIndicator"})
    }

    function getOriginStack (start, length=20) {
        let stack = []
        let lastOrigin = start
        for (let i = 0; i < length; i++) {
            if (!lastOrigin?.originView) break
            stack.push({
                origin: lastOrigin.originView,
                branch: lastOrigin
            })
            lastOrigin = lastOrigin.originView
        }
        return stack
    }

    let maxOriginIndicators = 10
    let selectedNodeView = appSession.selectedNode

    let newIndicatorStack = getOriginStack(selectedNodeView, maxOriginIndicators)
    let diffRemaningStack = originIndicators.filter(i => newIndicatorStack.find(ii => i.origin.id === ii.origin.id && i.branch.id === ii.branch.id)) || []
    let diffOldStack = originIndicators.filter(i => diffRemaningStack.indexOf(i) < 0) || []
    let diffNewStack = newIndicatorStack.filter(i => !diffRemaningStack.find(ii => i.origin.id === ii.origin.id && i.branch.id === ii.branch.id))

    console.log({originIndicators, newIndicatorStack, diffRemaningStack, diffOldStack, diffNewStack})

    diffOldStack.forEach(d => d.indicator.remove())

    diffNewStack.forEach(d => {
        d.indicator = createOriginIndicator(d.origin, d.branch)
        refs("Editor").querySelector(".overlay").append(d.indicator)
    })

    originIndicators = [...diffRemaningStack, ...diffNewStack]
       
}