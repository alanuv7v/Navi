import van from "vanjs-core"
const t = van.tags

import refs from "../Resources/DOMRefs"

export default class Logger {

    constructor (obj) {
        this.log(obj)
    }

    CommandButton = (key, value) => {
        
        let button = t.button()
        let children = t.div({style: "margin-left: 2em;"})

        let opened = false

        button.innerText = typeof value === "function" ? key + "()" : key
        button.onclick = () => {
            //execute function
            if (typeof value === "function") {
                
                console.log("executing: ", value) 

                refs("CommandPalette").focus()
                refs("CommandPalette").placeholder = "arguments..."
                
                let onArgumentsSubmit = (event) => {
                    value(event.target.value)
                    refs("CommandPalette").placeholder = ""
                    refs("CommandPalette").removeEventListener("blur", onArgumentsSubmit)
                }

                refs("CommandPalette").addEventListener("blur", onArgumentsSubmit)

                return 
            }
            
            //or show/hide children
            if (opened) {
                children.innerHTML = ""
                opened = !opened
                return
            }

            for (let e of Object.entries(value)) {
                children.append(this.CommandButton(e[0], e[1]))
            }
            opened = !opened
            

        }

        return t.div({class: "Log", style: "border-left: 1px solid var(--light); "},
            button,
            children
        )
    }

    log = (obj) => {
        refs("Logs").append(this.CommandButton("commands", obj))
    }
    
}