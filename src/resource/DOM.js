import appSession from "./appSession";
import van from "vanjs-core";

const tagsToUse = "div button input".split(" ")
const tag = {}

tagsToUse.forEach(t => {
    tag[t] = (id, props, ...children) => van.tags[t]({id: id, ...props}, children)
})

const {div, button, input} = tag

export default div("App", {},
    div("Header", {}, 
        button("PickRoot", {}, "木 "),
        button("History", {}, "H"),
        button("GoBack", {}, "◁"),
        button("GoForth", {}, "▷"),
        button("ToFrom", {}, "⇑"),
        button("ToLinks", {}, "⇓"),
        //button("RegrowTree", {}, "⟳"),
        input("GoTo"),
        button("Filter", {}, "Filter: "),
    ),
    div("Main", {}, 
        div("Commands", {},
            div("Logs"),
            input("CommandPalette"),
        ),
        div("View", {}, 
            div("Editor"),
            div("RawEditor"),
        ),
    ),
    div("Footer", {},
        div("States")
    ),
    div("LogsPreview")
)