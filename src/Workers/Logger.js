import van from "vanjs-core"
const t = van.tags

export default class Logger {

    constructor (obj) {
        this.log(obj)
    }

    DOM = t.div()

    CommandButton = (key, value) => {
        let button = t.button()
        let children = t.div({style: "margin-left: 2em;"})
        button.innerText = key
        button.onclick = () => {
            console.log(value)
            if (typeof value === "function") value()
            for (let e of Object.entries(value)) {
                children.append(this.CommandButton(e[0], e[1]))
            }
        }
        return t.div({class: "Log", style: "border-left: 1px solid var(--light); "},
            button,
            children
        )
    }

    log = (obj) => {
        this.DOM.append(this.CommandButton("commands", obj))
    }
    
}