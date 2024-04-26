import van from "vanjs-core"

const {div} = van

const refs = {
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
}

for (let [key, value] of Object.entries(refs)) {
    let name = key
    let DOM = value
    DOM.classList.add(name)
}

export default refs