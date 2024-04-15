import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t

import RawEditor from "../calc/RawEditor"

export default {
    App: null,
    //DOM: (id) => {this.App.getElementById(id)},
    //이 방법으로 매번 getElementById를 돌리는 연산을 하느니, 그냥 global.DOM에 다 레퍼런스들을 저장해두련다.
    DOM: 
    //추후 여러 군데에서의 DOM reference를 위해 미리 DOM 노드를 생성한 것일 뿐, "완성되어 있을 필요"는 없다. 즉 자식과 프롭과 이벤트리스너가 다 들어있지 않아도 된다.
    {
        Editor: div({id: "Editor", class: "window"}),
        RawEditor: textarea({id: "RawEditor", class: "YAMLpreview window", onblur: (event) => {RawEditor.createMirrorLinks(event.target.value)}}),
        View: div({id: "view", class:"main"}),
        ContextMenu: div({id: "ContextMenu", style: "bottom: 0px; display: flex; flex-direction: column-reverse; z-index: 2; width: 100%; padding: 0.5em;"}),
        LogPreview: div({id: "LogPreview"}),
        rootIO: button({id: "rootIO"}, "root: ") 
    },
    DB: null,
    root: {
        handle: null,
        metadata: null,
    },
    docs: null,
    settings: {
        handle: null,
        parsed: null,
        default: {
            yamlParseRules: {
                "body": str => str[0] === "_",
                "non-mirrored link": str => str[0]==="@" && str[1]==="!"
            },
            queryParseRuels: {
                divider: "/"
            }
        }
    }
}
//추후 여러 군데에서의 DOM reference를 위해 미리 DOM 노드를 생성한 것일 뿐, "완성되어 있을 필요"는 없다. 즉 자식과 프롭과 이벤트리스너가 다 들어있지 않아도 된다.
/* 
{
    Editor: div({id: "Editor", class: "window"}),
    RawEditor: textarea({id: "RawEditor", class: "YAMLpreview window", onblur: (event) => {RawEditor.createMirrorLinks(event.target.value)}}),
    View: div({id: "view", class:"main"}),
    ContextMenu: div({id: "ContextMenu", style: "bottom: 0px; display: flex; flex-direction: column-reverse; z-index: 2; width: 100%; padding: 0.5em;"}),
    LogPreview: div({id: "LogPreview"}),
    rootIO: button({id: "rootIO"}, "root: ") 
}
*/