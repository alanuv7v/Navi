import van from "vanjs-core";
import refs from "../Resources/DOMRefs";

const tagsToUse = "div button input".split(" ")
const tag = {}

tagsToUse.forEach(t => {
    tag[t] = (id, props, children) => van.tags[t]({id: id, ...props}, children)
})

const {div, button, input} = tag


export let building = div("Header", {}, 
    button("PickRoot")
)




const blueprint = {
    "Header div": [
        "PickRoot button"
    ]
}

/* {
    Header: div(),
    PickRoot: button(),
    GoBack: button(),
    GoForth: button(),
    VisitParent: button(),
    VisitChildren: button(),
    RegrowTree: button(),
    GoTo: input(),
    Filter: button(),
    View: div(),
    Editor: div(),
    RawEditor: div(),
    LogPreview: div(), 
} */

