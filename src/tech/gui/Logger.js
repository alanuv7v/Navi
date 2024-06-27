import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import appSession from "../../resource/appSession"


class Logger {
    
    expanded = false
    
    get logs () {
        return appSession.temp.logs
    }

    maxLogs = 100

    log (content, type) {
        
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
        this.DOM.querySelector("#logs").append(this.createLogView(data))
    }
    
    showAll() {
        let logViews = []
        for (let i = 0; i < 100; i++) {
            let data = appSession.temp.logs[i];
            if (!data) break
            logViews.push(this.createLogView(data))
        }
        this.DOM.querySelector("#logs").append(...logViews)
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
    
    onclick () {
        
        this.expanded = !this.expanded
        this.render()
        
    }
    
    DOM = div({id: "LogsView"},
        div({id: "logs"}),
        button({
            class: "expand",
            onclick: () => this.onclick()
        }, "<>")
    )

}

export default new Logger()