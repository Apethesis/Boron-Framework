function findFirst(array, index, value) {
    let returnVal
    array.forEach((element, indx) => {
        if (element[index] && element[index] === value) {
            returnVal = [ element[index], indx ]
            return
        }
    });
    return returnVal
}

function containsUppercase(str) {
    return /[A-Z]/.test(str);
}

function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = {
    findFirst: findFirst,
    containsUppercase: containsUppercase,
    isJSON: isJSON
}