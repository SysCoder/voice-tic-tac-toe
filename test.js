"use strict";


var o = {someValue: 1, anotherValue: 2};
var o2 = {
    aValue:3,
    ...o,
};

console.log(JSON.stringify(o2, null, 5));