// add the thousands separator to numbers.  ie 2,342,000
export function addCommas(x: string) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// convert a string to title case
// ex. "hello world" -> "Hello World"
export function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        }
    );
}
