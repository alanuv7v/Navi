import van from "vanjs-core";
import refs from "./DOMRefs";

const tagsToUse = "div button input".split(" ")
const tag = {}

tagsToUse.forEach(t => {
    tag[t] = (id, props, ...children) => van.tags[t]({id: id, ...props}, children)
})

const {div, button, input} = tag

export default div("App", {},
    div("Header", {}, 
        button("PickRoot", {}, "Root: "),
        button("GoBack", {}, "◁"),
        button("GoForth", {}, "▷"),
        button("VisitParent", {}, "⇑"),
        button("VisitChildren", {}, "⇓"),
        button("RegrowTree", {}, "⟳"),
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