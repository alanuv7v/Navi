// !!! 나중엔 이것 조차 Tree로 바뀔 수 있겠다. 버튼 클릭해서 함수  실행하게 해주면 되는거 아녀.

import van from "vanjs-core"
const t = van.tags

import refs from "../../resource/DOMRefs"

export default class CommandButton {

    constructor (name="", obj) {
        this.log(name, obj)
    }

    DOM = (key, value) => {
        
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
                
                let onArgumentsSubmit = async (event) => {
                    let actionResult = await value(event.target.value)
                    console.log(actionResult)
                    refs("CommandPalette").placeholder = ""
                    refs("CommandPalette").removeEventListener("blur", onArgumentsSubmit)
                }

                refs("CommandPalette").addEventListener("blur", onArgumentsSubmit)
                
            }
            
            //or show/hide children
            if (opened) {
                children.innerHTML = ""
                opened = !opened
                return
            }

            for (let e of Object.entries(value)) {
                children.append(this.DOM(e[0], e[1]))
            }
            opened = !opened
            

        }

        return t.div({class: "Command"},
            button,
            children
        )
    }

    log = (name, obj) => {
        refs("Logs").append(this.DOM(name, obj))
    }
    
}