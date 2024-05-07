import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import appSession from "../resource/appSession"
import Query from "./Query"
import Seed from "./Seed"


export default class Node  {
    

    constructor (key, value, parent) {
        
        //value = can be children
        //parent reference is needed to override modified data to the parent value
        
        this.key = key
        this.value = value
        this.parent = parent
        this.children = []
        this.update()
        this.render()

        console.log(this.pathString(), this)

    }

    selected = false
    opened = false
    filter = null
    
    path () {
        let parentPath = this?.parent?.path()
        if (parentPath) return [...parentPath, this.key]
        else return [this.key]
    }
    
    pathString () {
        return this.path().join("/")
    }

    DOM = div({class: `node`},
        textarea({class: "key", onclick: (event) => this.#onclick(event), onchange: (event) => {this.#onKeyChange(event)}}),
        div({class: "value"}),
    )

    update () {
        if (typeof this.value === "object" && this.value) {
            this.children = Object.entries(this.value).map(([key, value]) => {
                if (key === this.filter || !this.filter) {
                    return new Node(key, value, this)
                }
            })
        } 
    }

    render() {
        

        //update key DOM value
        this.DOM.querySelector(".key").value = this.key
        
        this.open()

        return true

    }

    #onclick () {
        if (this.selected ) {
            this.DOM.classList.remove("selected")
            appSession.selectedNode = null
        } else {
            if (appSession.selectedNode) {
                appSession.selectedNode.selected = false
                appSession.selectedNode.DOM.classList.remove("selected")
            }
            this.DOM.classList.add("selected")
            appSession.selectedNode = this
        }
        
        this.selected = !this.selected 
        console.log(this)
        return this
    }

    #onKeyChange (event) {
        let originalKey = this.key
        this.key = event.target.value
        this.updateParentValue(originalKey) 
        return this
    }
    
    #onValueChange (event) {
        this.value = event.target.value
        this.updateParentValue() 
        return this
    }

    moveUp() {

    }
    moveDown() {

    }
    depthUp() {

    }
    depthDown() {

    }

    delete() {
        delete this.parent.value[this.key]
        this.DOM.remove()
        this.parent.update()
        return true
    }

    open () {
        //reset value DOM
        this.DOM.querySelector(".value").innerHTML = ""


        if (typeof this.value === "object" && this.value) {
            for (let childNode of this.children) {
                this.DOM.querySelector(".value").append(
                    childNode.DOM
                )
            }
        } else if (this.value) {
            this.DOM.querySelector(".value").append(textarea(
                {value: this.value, onchange: (event) => this.#onValueChange(event)}
            ))
        }

        this.opened = true

    }

    close () {

        this.DOM.querySelector(".value").innerHTML = ""
        this.opened = false

    }

    isLink () {
        if (typeof this.value === "string" && this.value[0] === "@") return true
        return false
    }

    async stemOut () {
        
        if (!this.isLink()) return "This node is not a link!"
        
        let linkString = this.value.slice(1)

        let newSeed = new Seed(linkString)
        newSeed.node = this
        
        await newSeed.parse()

        this.value = newSeed.treeData
        this.update()
        this.render()

        appSession.seeds.push(newSeed)

        return newSeed
    }

    changeParent (value) {
        
        let originalParent = this.parent

        if (originalParent) {
            delete originalParent.value[this.key]
            let thisIndex = originalParent.children.indexOf(this)
            originalParent.children.splice(thisIndex, 1)
            originalParent.render()
        }

        this.parent = value
        this.updateParentValue()
        this.parent.children.push(this)
        this.parent.render() // 직계 부모만 rerender 하면 됨.
        
        console.log(originalParent, this.parent)
        
        return true
    }
    
    updateParentValue (originalKey) {

        if (this.isLink()) return false
        if (!this?.parent) return false

        if (typeof this.parent.value === "object" && this.parent.value) {
            if (originalKey) delete this.parent.value[originalKey]
            this.parent.value[this.key] = this.value
        } 
        else {
            let originalValue = this.parent.value
            let newKey = this.key
            let newValue = this.value
            this.parent.value = {
                0: originalValue,
                [newKey]: newValue
            }
        }
        this.parent.updateParentValue()
        return this.parent.value
    }
    
    mirror () { //create mirror link depending on its value
        
    }

}