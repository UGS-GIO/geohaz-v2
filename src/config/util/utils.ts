// add the thousands separator to numbers.  ie 2,342,000
export function addCommas(x: string) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
