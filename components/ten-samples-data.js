const samples = [
    { x: 0.3, y: 0.6, label: true},
    { x: 0.25, y: 0.4, label: true},
    { x: 0.5, y: 0.32, label: true},
    { x: 0.7, y: 0.39, label: true},
    { x: 0.52, y: 0.63, label: true},
    { x: 0.1, y: 0.2, label: false},
    { x: 0.8, y: 0.16, label: false},
    { x: 0.03, y: 0.5, label: false},
    { x: 0.57, y: 0.78, label: false},
    { x: 0.9, y: 0.5, label: false}
]

const tightestFit = {

}

const loosestFit = {

}

const maxMargin = {

}

const tightestFitStrips = {
    top: {
        t: {},
        tprime: {}
    },
    right: {
        t: {},
        tprime: {}
    },
    bottom: {
        t: {},
        tprime: {}
    },
    left: {
        t: {},
        tprime: {}
    }
}

module.exports = { samples, tightestFit, loosestFit, maxMargin, tightestFitStrips }