export default class Session {
    Clipboard = {
        data: [],
        get lastItem () {
            return this.data[this.data.length-1]
        }
    }
}