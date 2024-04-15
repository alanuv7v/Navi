import global from "../global/global";

export default ContextMenu  = {
    MenuItem: (rowIndex, name, action, children) => {
        return button({onclick: (event) => {
          action();
          if (children) updateContextMenu(rowIndex,  children);
        }}, name)
    },
    Menu: (menuData) => {
        return div(
            {style: "display: flex; flex-direction: row"}, 
            menuData.map(m => MenuItem(index, m.name, m.action, m.children))
        )
    },
    replace: (rows) => {
        let rows = Array.isArray(rows) ? rows : [rows]
        //remove prev
        global.ContextMenu.innerHTML = ""
        /* while (global.ContextMenu.hasChildNodes()) {
            global.ContextMenu.firstChild.remove() 
        } */
        for (let row of rows) {
            global.ContextMenu.append(row)
        }
    },
    update: (prev, fromRowIndex, toAdd) => {
        this.replace([...prev.slice(0, fromRowIndex), Menu(toAdd)])
    }
}
