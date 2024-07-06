import appSession from "./appSession";
import van from "vanjs-core";

import * as userActions from "../natural/userActions"
import refs from "./DOMRefs";
import CommandsTree from "../entity/view/CommandTree";
import Logger from "../tech/gui/Logger";
import { updateOriginIndicators } from "../natural/AutoActions";

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
            div("Editor", {}, 
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

