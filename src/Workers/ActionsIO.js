import van from "vanjs-core"
const t = van.tags

import refs from "../Resources/DOMRefs"

export default class {

    constructor (name="", obj) {
        this.log(name, obj)
    }

    CommandButton = (key, value) => {
        
        let button = t.button()
        let children = t.div({style: "margin-left: 2em;"})
        let childrenCount = Object.keys(value).length

        let opened = false

        button.innerText = key
        if (typeof value === "object" && value) button.innerText += `[${childrenCount}] `
        if (typeof value === "function") {
            button.innerText += "()"
            button.classList.add("function")
        }

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

        return t.div({class: "Command", style: "border-left: 1px solid var(--light); "},
            button,
            children
        )
    }

    log = (obj) => {
        refs("Logs").append(this.CommandButton(name, obj))
    }
    
}