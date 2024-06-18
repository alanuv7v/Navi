import appSession from "./appSession";
import van from "vanjs-core";

import * as userActions from "../natural/userActions"
import refs from "./DOMRefs";
import CommandsTree from "../entity/view/CommandTree";

const tagsToUse = "div button input".split(" ")
const tag = {}

tagsToUse.forEach(t => {
    tag[t] = (id, props, ...children) => van.tags[t]({id: id, ...props}, children)
})

const {div, button, input} = tag

export default div("App", {},
    div("Header", {class: "window"}, 
        button("PickRoot", {onclick: () => {
            new CommandsTree(userActions.Root, false)
        }}, "木 "),
        button("History", {}, "↹"),
        button("GoBack", {}, "◁"),
        button("GoForth", {}, "▷"),
        button("ToOrigin", {}, "⇑"),
        button("ToLinks", {}, "⇓"),
        button("Path", {}, "//"),
        button("Adress", {}, ">>"),
        //button("RegrowTree", {}, "⟳"),
        input("GoTo", {onchange: (event) => {
            userActions.Navigate.showNode(event.target.value)
        }}),
        input("Filter", {type: "text", placeholder: "filter", value: "*"}),
    ),
    div("Main", {}, 
        div("Commands", {class: "window"},
            div("Logs"),
            input("CommandPalette"),
        ),
        div("View", {class: "window"}, 
            div("Editor"),
        ),
    ),
    div("Footer", {},
        div("States")
    ),
    div("LogsPreview")
)