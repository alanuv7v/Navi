import Logger from "./gui/Logger";

export default function () {

    window.onunhandledrejection = event => {
        Logger.log(`${event.reason}`, "error unhandled");
    };
      
    window.onerror = function(message, source, lineNumber, colno, error) {
        Logger.log(`${error.stack}`, "error unhandled");
    };

    window.addEventListener("error", function (errorEvent) {
        Logger.log(`${errorEvent.error.stack}`, "error unhandled");
        return false;
     })

}
