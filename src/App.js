import van from "vanjs-core"
const t = van.tags
const {div, span, button, textarea, input, a} = t
const d = div

import { createEvent, createStore } from "effector" 

import * as yaml from 'yaml'
import File from "./comps/FileViewer/File"
import Folder from "./comps/FileViewer/Folder"
import { MultilineTextarea, resizeTextarea } from "./comps/MultilineTextarea"


/* 
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
codeanywhere에서 변경사항 있을 시 커밋 뿐만 아니라 push도 꼭 해야한다. 하고나서 깃허브에서 잘됬는지 한번더 확인할것
*/

//util
const log = (text) => console.log(text)


//global variables
const global = {}

let head = (async function () {return await import('./data/docs/Alan.yaml')})()

let initTargets = {
  'MultilineTextarea' : []
}

const FileList = (head, path) => {
  let pathResult = nestedObj(head, path)
  let items = []
  for (let e of Object.entries(pathResult)) {
      switch (typeof e[1]) {
          case "object":
              items.push(Folder(e[0], path, updateFileList))
              break
          default:
              items.push(File(e[0], e[1]))
      }
  }
  return items
}

const FileViewer = (path) => {
    return div(
        {class: "FileViewer"},
        global.FileList
    )
}

function updateFileList(head, path) {
  let list = FileList(head, path)
  for (let item of list) {
    global.FileList.append(item)
  }
  return list
}



const MenuItem = (menuIndex, name, action, children) => {
  console.log('At MenuItem init, menus.getState() = ', JSON.stringify(menus.getState(), null, 2) + '. Index is ' + menuIndex)  
  return button({onclick: (event) => {
    action();
    updateContextMenu({fromIndex: menuIndex, toAdd: children});
  }}, name
  )
}

const Menu = (menuItems) => {
  let index = menus.getState().length
  let MenuItems = []
  for (let m of menuItems) {
    MenuItems.push(MenuItem(index, m.name, m.action, m.children))
  }
  return div({style: "display: flex; flex-direction: row"}, MenuItems)
}
global.menus = createStore([])
let menus = global.menus

menus.watch(ms => {
  if (global.ContextMenu) {
    while (global.ContextMenu.hasChildNodes()) {
      global.ContextMenu.firstChild.remove() 
    }
    for (let menuItems of ms) {
      menuItems = Array.isArray(menuItems) ? menuItems : [menuItems]
      global.ContextMenu.append(Menu(menuItems))
    }
  }
})

let updateContextMenu = createEvent()

menus
  .on(updateContextMenu, function(prev, props) {
        let {fromIndex, toAdd} = props
        console.log('update ContextMenu: ' + JSON.stringify([...prev.slice(0, fromIndex), toAdd], null, 2))
        return [...prev.slice(0, fromIndex), toAdd]
      })

  /* 
function updateMenus(fromIndex, childrenMenus) {
  menus.val = [...menus.val.slice(0, fromIndex), childrenMenus]
  return menus.val
} */



function init() {

  let defaultMenu = [
    {name: 'Item', action: function() {alert('!')}, 
      children: [
        {name: 'child 1'}, 
        {name: 'child 2', action: function() {alert('child 2')}, 
          children: [{name: 'childrennnn'}]
        }
      ]
    }
  ]

  for (let mt of initTargets['MultilineTextarea']) {
    resizeTextarea(mt.children[0], mt.children[1])
  }

  updateContextMenu({fromIndex: 0, toAdd: defaultMenu})


}


function nestedObj(obj, props, value, command=false) {
    if (!props) return obj;
    if (props.length === 0) return obj
    let prop;
    for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
      prop = props[i];
      let candidate = obj[prop];
      if (candidate !== undefined) {
        obj = candidate;
      } else {
        break;
      }
    }
    if (value) {
        obj[props[i]] = value;
        return obj
    }
    switch (command) {
        case "delete":
            delete obj[props[i]]
            return
        default: 
            break
    }
    return obj[props[i]]
}

//nestObj 사용 예시:
/* var obj = {
    foo: {
        bar: {
        baz: 'x'
        }
    }
};

nestedObj(obj, ["foo", "bar", "baz"], 'y'); */

const Group = (name, innie) => {
  return div({class: "group", style: "border-left: 4px solid var(--light); display: flex; flex-direction: column;"},
    div({class: "main"}, name),
    div({style: "display: flex; flex-direction: row;"},
      innie
    )
  )
}

global.TextModifiers = div(
  {id: "TextModifiers", class:"main"},
  Group(
    "Syntax",
    [button("#Title"),
    button(">depth+"),
    button("<depth-"),
    button("[link]"),
    button("[tie|link]")]
  ),
  Group(
    "Style",
    [button("!Bold!"),
    button("_Underline_"),
    button("/Italic/"),
    button("~Strike~"),]
  ),
  Group(
    "Organize",
    [button("* Ul"),
    button("1. Ol"),
    button("“quote”"),
    button("[link]"),
    button("[tie|link]")]
  ),
  Group(
    "Ect",
    [button("?c.compile")]
  ),
)


//App

global.View = div({id: "view", class:"main"})
global.FileViewer = FileViewer([])
global.View.append(global.FileViewer)
global.View.append(global.TextModifiers)
global.FileList = div({id: "FileList"})
global.FileViewer.append(global.FileList)
global.ContextMenu = d({style: "bottom: 0px; display: flex; flex-direction: column-reverse; z-index: 2; width: 100%; padding: 0.5em;"})

const App = (head) => {
    
    let seed = Folder()
    //let seed = InOutInterface([], head, 10)
  
  
    return div({id: 'App', /* style: "display: flex; flex-direction: row; " */},
      div({id: "header", style: "display: flex; flex-direction: row; "},
        button("root: Alan"),
        button("◁"),
        button("▷"),
        button({onclick: () => updateFileViewer(path.slice(0, -1))}, "⇑"),
        button("⇓"),
        button("⟳"),
        input({style: "flex-grow: 1;", type: "text", value: "root"}),
        button("axis: All"),
      ),
      [global.View, global.ContextMenu]
    )
}
  
head.then((h) => {
    console.log("GLOBAL:", global)
    global.head = h.default
    global.NO = nestedObj
    head = h.default
    van.add(document.body, App({"Root": h.default}))
    updateFileList(head, [])
    init()


})

