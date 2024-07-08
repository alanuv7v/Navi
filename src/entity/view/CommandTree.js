// !!! 나중엔 이것 조차 Tree로 바뀔 수 있겠다. 버튼 클릭해서 함수  실행하게 해주면 되는거 아녀.

import van from "vanjs-core"
const t = van.tags

import refs from "../../resource/DOMRefs"
import * as userActions from "../../natural/userActions"

import Logger from "../../tech/gui/Logger"
import hearCommand from "./hearCommand"

export default class CommandsTree {

    constructor (data, isDefault=true) {
        
        this.data = data
        
        refs("Logs").innerHTML = ""

        if (!isDefault) {
            let backToDefault = new CommandButton("...", () => {
                refs("Logs").innerHTML = ""
                new CommandsTree({...userActions})
            })
            refs("Logs").append(backToDefault.DOM)
        }

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
        this.backToDefault = this.name === "..."
        
        let button = this.DOM.querySelector("button")
        
        button.innerText = this.name.replaceAll("_", " ")

        if (typeof value === "object" && value && this.showChildrenCount) {    
            let childrenCount = Object.keys(value).length
            button.innerText += `[${childrenCount}] `
        }
        else if (this.backToDefault) {
            console.log(this.name)
        }
        else if (typeof value === "function") {
            button.classList.add("function")
        }

    }

    showChildrenCount = false

    opened = false

    get requireParams () {
        return (typeof this.value === "function") && (this.name.slice(-1) === "_")
    }

    onclick = async () => {
        //execute function

        if (this.backToDefault) {

            this.value()

        } else if (typeof this.value === "function") {
            
            Logger.log(`executing: ${this.name}()`) 

            if (this.requireParams) {

                hearCommand(this.value)
            
            } else {

                let actionResult = await this.value()
                Logger.log(`action result: ${actionResult}`)

            }
            
            
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