import van from "vanjs-core"
import { createEvent, createStore } from "effector" 

import * as yaml from 'yaml'
import { MultilineTextarea, resizeTextarea } from "./comps/MultilineTextarea"


/* 
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
codeanywhere에서 변경사항 있을 시 커밋 뿐만 아니라 push도 꼭 해야한다. 하고나서 깃허브에서 잘됬는지 한번더 확인할것
*/

//util
const log = (text) => console.log(text)

const t = van.tags
const {div, span, button, textarea, input, a} = t
/* destructuring 만세!! */
const d = div

//global variables
const global = {}

let head = (async function () {return await import('./data/docs/Alan.yaml')})()

let testObj = {
  fruits: {
    apple: {
      color: 'red',
      taste: ['sweet', 'sour']
    }
  }
}



let initTargets = {
  'MultilineTextarea' : []
}

const FileViewer = (path) => {

    console.log(head, path, nestedObj(head, path))
    let data = nestedObj(head, path)
    let items = []
    for (let e of Object.entries(data)) {
        switch (typeof e[1]) {
            case "object":
                items.push(Folder(e[0], path))
                break
            default:
                items.push(File(e[0], e[1]))
        }
    }

    return div(
        {class: "FileViewer"},
        div({class: "heading"},
            button("<"),
            button(">"),
            button("⟳"),
            button({onclick: () => updateFileViewer(path.slice(0, -1))}, "⇑"),
            input({type: "text", value: ["root", ...path].join("/")})
        ),
        items
    )
}

function updateFileViewer(path) {
    global.View.children[0].remove()
    global.View.append(FileViewer(SVGClipPathElement))
    return true
}

const Folder = (key, path) => {
    function onClick(event) {
        updateFileViewer([...path, key])
    }
    return div(
        {class: "Folder", style: "width: 100%;"}, 
        //input({type: 'text', value: key, onclick: (event) => onClick(event)})
        button({onclick: (event) => onClick(event)}, key)
    )
}

const File = (key, file) => {
    function onClick(event) {
        console.log(key, file)
    }
    return div(
        {class: "File", style: "width: 100%;"}, 
        //input({type: 'text', value: key, onclick: (event) => onClick(event)})
        //button({onclick: (event) => onClick(event)}, key)
        a({href: ''}, key)
    )
}

const InOutInterface = (path=[], head, iteration, keyType) => {
    //if ('name' in data) data.name = 'asdf'; console.log(data, head); return
    //proved that the data property is referencing prop in head. But still input elems cannot change head's prop.
    if (iteration < 1) {
        return
    }
    if (!head) {
        return
    }

    let resizeTargets = []

    let key = path.length > 0 ? path[path.length-1] : ""
    let data = nestedObj(head, path)
    console.log(path, key, data, head)

    let prevKey = key
    
    let key_

    if (keyType==="Array") {
        key_ = MultilineTextarea(
        textarea(key),
        textarea({style: "color: rgb(61 210 227)"}, key)
        )
    } else {
        key_ = MultilineTextarea(
        textarea({oninput: (event) => {
            let originalValue = (nestedObj(head, path))
            nestedObj(head, path.slice(0, -1), 
                {...nestedObj(head, path.slice(0, -1))/* siblings */,
                [event.target.value]: originalValue}
            )
            path = [...path.slice(0, -1), event.target.value]
            if (prevKey) nestedObj(head, [...path.slice(0, -1), prevKey], null, "delete")
            prevKey = event.target.value
            console.log(nestedObj(head, path), head, prevKey)
        }}, key),
        textarea({style: "color: rgb(80 215 154)"}, key)
        )
    }

    resizeTargets.push(key_)

    //!!!!!!!! textarea에서 set할 때도 head에서부터 nestedObj 함수로 안에 있는 값을 바꿔야 한다. Path가 너무 길어지는 비효율의 발생은 Dictionary를 만들고, 사전에 고유명사가 등록되면 고유명사에 nested된 prop은 고유명사 obj 안에만 들어있게 하자. 아니면 진짜 head를 listify해버리자. 쉬운 레퍼런스, shallow copy 위해.
    //setting values_
    let values_ = []
    if (typeof data != 'object') { // value is not Object, or it is null
        values_ = MultilineTextarea(
        textarea({oninput: (event) => {
            nestedObj(head, path, event.target.value)
            console.log(nestedObj(head, path), head)
        }}, data),
        textarea(data)
        )
        resizeTargets.push(values_)

    } else { // value is Object
        if (data == null) {
            values_ = d({style:"display: flex"},
                t.select(
                    t.option("null"),
                    t.option("String"),
                    t.option("Number"),
                    t.option("List"),
                    t.option("Object"),
                    t.option("Boolean"),
                    t.option("Image"),
                    t.option("File"),
                    t.option("Else..."),
                )
            )
        }
        let childKeyType
        if (Array.isArray(data)) childKeyType = "Array"
        for (let key in data) {
            values_.push(IOI([...path, key], head, iteration, childKeyType))
        }
    }
    iteration--

    let valueWrapper = d({class:"valueWrapper", style: "padding-left: 1em; padding-bottom: 1em; padding-right: 1em;"},
            values_
        )


    function resize() {
        for (let mt of resizeTargets) {
            resizeTextarea(mt.children[0], mt.children[1])
        }   
        console.log(values_)
        for (let v of values_) {
            resizeIOI(v)
        }
    }

    let foldArrow = d({style: "margin-left: auto"}, "\u25BD")

    function fold() {
        valueWrapper.style.display = "none";
        foldArrow.innerText = "\u25C1"
    }
    function open() {
        valueWrapper.style.display = "block";
        foldArrow.innerText = "\u25BD"
        resize()
        
    }

    function onIOIwheel(event) {
        
        if (!event.shiftKey) {return}

        event.preventDefault()
        event.stopPropagation()

        if (event.deltaY < 0) {//up
            open()
        }
        else { 
            fold()
        }
    }
    fold()

    initTargets["MultilineTextarea"].push(...resizeTargets)

    let main = div({class: "main IOI", onwheel: () => onIOIwheel(event)}, 
        d({style: "display:flex; flex-direction: row"},
            key_,
            foldArrow
        ),
        valueWrapper
    )

    return main
}

const IOI = InOutInterface




function resizeIOI(target) {
    let children = Array.from(target.children)
    let resizeTargets = [...children.filter((c) => {return c.classList.contains("MultilineTextarea")}), 
                        ...Array.from(children.find((c) => {return c.classList.contains("valueWrapper")}).children).filter((c) => {return c.classList.contains("MultilineTextarea")})
                        ]
    console.log(resizeTargets)
    for (let mt of resizeTargets) {
        resizeTextarea(mt.children[0], mt.children[1])
    }   
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


const ContextMenu = () => {

  return d({style: "bottom: 0px; display: flex; flex-direction: column-reverse; z-index: 2; border: 1px solid white; width: 100%; padding: 0.5em;"})
}


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


//App

global.View = div({id: "view", class:"main"})

const App = (head) => {
    
    let seed = Folder()
    //let seed = InOutInterface([], head, 10)
  
    global.ContextMenu = ContextMenu()
    global.View.append(FileViewer([]))
  
    return div({id: 'App', /* style: "display: flex; flex-direction: row; " */},
      div({id: "header", style: "display: flex; flex-direction: row; "},
        button({style: "flex-grow: 1;"}, "Root: Alan √"),
        button("axis: All"),
        button("account"),
        button("settings"),
        button({style: "margin-left: auto"}, "Root ver 0.1")
      ),
      [global.View, global.ContextMenu]
    )
}
  
head.then((h) => {
    head = h.default
    van.add(document.body, App({"Root": h.default}))
    init()

})

