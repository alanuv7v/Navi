// !!! 나중엔 이것 조차 Tree로 바뀔 수 있겠다. 버튼 클릭해서 함수  실행하게 해주면 되는거 아녀.

import van from "vanjs-core"
const t = van.tags

import refs from "../../resource/DOMRefs"

export default class CommandsTree {

    constructor (data) {
        this.data = data
        for (let [key, value] of Object.entries(data)) {
            let seed = new CommandButton(key, value)
            refs("Logs").append(seed.DOM)
        }
    }
    
}

class CommandButton {

    constructor (name, value) {
        
        this.name = name
        this.value = value
        
        let button = this.DOM.querySelector("button")
        
        button.innerText = this.name

        if (typeof value === "object" && value) {    
            let childrenCount = Object.keys(value).length
            button.innerText += `[${childrenCount}] `
        }

        if (typeof value === "function") {
            button.innerText += "()"
            button.classList.add("function")
        }

    }

    opened = false

    onclick = () => {
        //execute function
        console.log(this)
        if (typeof this.value === "function") {
            
            console.log("executing: ", this.value) 

            refs("CommandPalette").focus()
            refs("CommandPalette").placeholder = "arguments..."
            
            let onArgumentsSubmit = async (event) => {
                let actionResult = await this.value(event.target.value)
                console.log(actionResult)
                refs("CommandPalette").placeholder = ""
                refs("CommandPalette").removeEventListener("blur", onArgumentsSubmit)
            }

            refs("CommandPalette").addEventListener("blur", onArgumentsSubmit)
            
        } else {
        
            let childrenDOM  = this.DOM.querySelector(".children")
            //or show/hide children
            if (this.opened) {
                childrenDOM.innerHTML = ""
                this.opened = false
                
            } else {
                for (let [key, value] of Object.entries(this.value)) {
                    let child = new CommandButton(key, value)
                    childrenDOM.append(child.DOM)
                    this.opened = true
                }
            }

        }

    }


    DOM = t.div({class: "Command"},
        t.button({
            onclick: this.onclick,
        }),
        t.div({class: "children", style: "margin-left: 2em;"})
    )

}