import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import appSession from "../../appSession"


class Logger {
    
    expanded = false

    excludeFilter = null
    
    get logs () {
        return appSession.temp.logs
    }

    maxLogs = 100

    log (content, type) {

        console.log(content)
        
        if (appSession.temp.logs.length > this.maxLogs) {
            appSession.temp.logs = appSession.temp.logs.slice(-this.maxLogs)
        }
        
        appSession.temp.logs.push({content, type})
        this.render()

    }
    
    createLogView (data) {
        let {content, type} = data
        return div(
            {class: type ? `log ${type}` : "log", innerHTML: content}
        )
    }

    showLastone() {
        let data = appSession.temp.logs[appSession.temp.logs.length-1]
        if (!data) return
        this.DOM.querySelector("#logs").append(this.createLogView(data))
    }
    
    showAll() {
        let logViews = []
        for (let i = 0; i < 100; i++) {
            let data = appSession.temp.logs[i];
            if (!data) break
            if (data?.type?.split(" ")?.includes(this.excludeFilter)) break
            logViews.push(this.createLogView(data))
        }
        this.DOM.querySelector("#logs").append(...logViews)
        this.DOM.querySelector("#logs").scroll(0, this.DOM.querySelector("#logs").scrollHeight)
    }

    render () {
        
        this.DOM.querySelector("#logs").innerHTML = ""
        if (this.expanded) {
            this.showAll()
            this.DOM.classList.add("expanded")
        }
        else {
            this.showLastone()
            this.DOM.classList.remove("expanded")
        }
        
    }

    clear () {
        appSession.temp.logs = []
        this.render()
    }
    
    onclick () {
        
        this.expanded = !this.expanded
        this.render()
        
    }
    
    DOM = div({id: "LogsView"},
        div({id: "logs"}, 
        ),
        div({class: "options"},
            button({
                class: "expand",
                onclick: () => this.onclick()
            }, "<>"),
            button({
                onclick: () => this.clear()
            }, "Clear"),
            button({
                onclick: () => {
                    if (this.excludeFilter === 'unhandled') {
                        this.excludeFilter = null
                    } else {
                        this.excludeFilter = 'unhandled'
                    }
                    this.render()
                }
            }, "Show Unhandled Errors"),
        )
    )

}

export default new Logger()