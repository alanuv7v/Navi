import appSession from "./appSession";
import van from "vanjs-core";

import * as userActions from "../natural/userActions"
import refs from "./DOMRefs";
import CommandsTree from "../entity/view/CommandTree";
import Logger from "../tech/gui/Logger";
import { updateOriginIndicators } from "../natural/AutoActions";

const tagsToUse = "div button input dialog".split(" ")
const tag = {}

tagsToUse.forEach(t => {
    tag[t] = (id, props, ...children) => van.tags[t]({id: id, ...props}, children)
})

const {div, button, input} = tag

import aboutDOM from "./About";

export default div("App", {
        style: "font-size: 16px;"
    },
    div("Header", {class: ""}, 
        div("QuickActions", {}, 
            button("ShowAbout", {
                tooltip: "About"
            }, "木"),
            aboutDOM,
            button("History", {
                tooltip: "History"
            }, "↹"),
            button("GoBack", {
                tooltip: "Go Back"
            }, "◁"),
            button("GoForth", {
                tooltip: "Go Forth"
            }, "▷"),
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
            div("Editor", {oncontextmenu: (event) => {
                event.preventDefault()
                event.stopPropagation()
                return false
            }}, 
                div("Nodes"),
                div("", {class: "overlay"})
            )
        ),
    ),
    div("Footer", {class: ""},
        div("States"),
        Logger.DOM,
        input("CommandPalette"),
    ),
)

