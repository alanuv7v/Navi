//!! obsolete
//안쓰는게 낫다. 애초에 ContextMenu의 의의가 이게 없는거다. ContextMenu의 각 Row가 그룹이나 다름없다. 이전 메뉴의 클릭됬던 버튼이 곧 그룹 이름이다.

export default Group = (name, innie) => {
    return div({class: "group"},
        div({style: "text-align: center; width: 100%; align-items: center;"}, name),
        div({style: "display: flex; flex-direction: row; align-items: center;"},
            innie
        )
    )
}
