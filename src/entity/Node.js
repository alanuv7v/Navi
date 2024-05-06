import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import appSession from "../resource/appSession"
import Query from "./Query"


export default class Node  {
    

    constructor (key, value, parent) {
        
        //value = can be children
        //parent reference is needed to override modified data to the parent value
        
        this.key = key
        this.value = value
        this.parent = parent
        this.children = []

        if (typeof this.value === "object" && this.value) {
            this.children = Object.entries(this.value).map(([key, value]) => {
                if (key === this.filter || !this.filter) {
                    return new Node(key, value, this)
                }
            })
        } 

        this.render()

        console.log(this.pathString(), this)

    }

    selected = false
    
    path () {
        let parentPath = this?.parent?.path()
        if (parentPath) return [...parentPath, this.key]
        else return [this.key]
    }
    
    pathString () {
        return this.path().join("/")
    }

    DOM = div({class: `node`},
        textarea({class: "key", onclick: () => this.#onclick()}),
        div({class: "value"}),
    )

    filter = null

    render() {
            
        this.DOM.querySelector(".value").innerHTML = ""

        //show key
        this.DOM.querySelector(".key").value = this.key

        const showValue = () => {
            this.DOM.querySelector(".value").append(textarea(this.value))
        }

        const showChildren = () => {
            for (let childNode of this.children) {
                this.DOM.querySelector(".value").append(
                    childNode.DOM
                )
            }
        }
        
        if (typeof this.value === "object" && this.value) {
            showChildren()
        } else {
            showValue()
        }

        return true

    }

    #onclick = () => {
        if (this.selected ) {
            this.DOM.classList.remove("selected")
        } else {
            this.DOM.classList.add("selected")
            appSession.tree.selectedNode = this
        }
        
        this.selected = !this.selected 
        
    }

    moveUp() {

    }
    moveDown() {

    }
    depthUp() {

    }
    depthDown() {

    }

    addChild(key, value) {
        if (typeof this.value != "object") {
            let originalValue = this.value
            this.value = {
                0: originalValue
            }
        }
        this.value[key] = value
        this.render()
        return this.value
    }

    delete() {
        delete this.parent.value[this.key]
        this.DOM.remove()
        this.parent.update()
        return true
    }

    hide () {
        this.DOM.style.display = "none"
    }

    show () {
        this.DOM.style.display = "block"
    }

    open () {
        this.render()
    }

    close () {
        this.DOM.querySelector(".value").innerHTML = ""
        this.children = []
    }

    isLink () {
        if (typeof this.value === "string" && this.value[0] === "@") return true
        return false
    }

    async stemOut () {
        // !! 내가 지금 생각하는 것: stemOut할 때는 children에 새 노드가 추가되지만, 이 노드의 value는 변하지 않는다. 또한 새 노드의 parent에 이 노드가 추가되지 않는다.
        // 따라서 appSession.seed.node.value는 stemOut으로 생긴 노드의 부모에 영향받지 않는다.
        // UserActions.saveChange() 시에 stemOut node의 변화는... 어떻게 해야 할까.
        /* 
        열려있는 모든 다른 document들에 각기 다른 node value를 저장해야 한다.
        우선 열려있는 모든 document들과 각자의 seed를 기록한다.
        그들을 순회하며 그 seed의 value를 seed.document.handle에 저장하면 된다.
        메인으로 열리는건 appSession.seed다.
        그럼 그 seed에서 열린 다른 seed들은... 어디 저장하지. seed.seeds에 저장해야 하나? seed[접목된 tree의 seed를 지칭하는 어떤 명사]에 저장하면 좋을듯.
        이름을 짓는게 역시 관건...
         */

        if (!this.isLink()) return "This node is not a link, thus cannot stem out. Try open() instead."
        let linkString = this.value.slice(1)
        let query = new Query(linkString)
        let {document, treeData} = await query.parse()
        this.addChild(this.key, treeData)
        return treeData
    }

    changeParent (value) {
        
        let originalParent = this.parent

        if (originalParent) {
            delete originalParent.value[this.key]
            originalParent.render()
        }

        this.parent = value
        this.updateParentValue()
        this.parent.render()

        this.parent.updateParentValue()
        
        console.log(originalParent, this.parent)
        
        return true
    }
    
    updateParentValue () {
        if (!this?.parent) return false

        if (typeof this.parent.value === "object" && this.parent.value) {
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
        return this.parent.value
    }

}