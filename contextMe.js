const array = [
    {
        firstName: 'Vu',
        lastName: 'Nguyen'
    },
    {
        firstName: 'Marcellus',
        lastName: 'Pelcher'
    },
    {
        firstName: 'Tha',
        lastName: 'Rajasombat'
    },
    {
        firstName: 'Jane',
        lastName: 'Pelcher'
    }
];
const newArr = array.map(({firstName, lastName}) => ({
    name: `${firstName} ${lastName}`
}));
console.log(newArr)
const [firstPerson, secondPerson, ...otherPeople] = newArr;
console.log(firstPerson);
console.log(secondPerson);
console.log(otherPeople);

const fn = (a, b, c, ...otherParams) => {
    console.log('a', a);
    console.log('b', b);
    console.log('c', c);
    console.log('otherParams', otherParams);
}
fn(1, 2, 3, 4, 5, 6, 7, 8, 9);
const subtract = (start, ...numbers) => {
    numbers.forEach(n => {
        start += n;
    })
    return start;
};
console.log(subtract(100, 324, 2, 4));
const bigObject = {
    a: 1, b: 2, c: 3
}
const {a, b, c} = bigObject;
console.log(a, b, c);
console.log({a, b, c, d: 5});
let sandwichNumber = 0;
const makeMeaSandWich = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        sandwichNumber++;
        resolve(`Sandwich ${sandwichNumber} is ready`)
    }, 300);
});

makeMeaSandWich()
    .then((data) => {
        console.log(data);
        return makeMeaSandWich();
    })
    .then(data => {
        console.log(data)
        return makeMeaSandWich();
    })
    .then(data => {
        console.log(data)
        return makeMeaSandWich();
    })
    .then(data => {
        console.log(data)
        return makeMeaSandWich();
    });
const fetchUser = (userId) => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({
            userId,
            name: `${userId} player`
        })
    }, 1000)
});
const setUserData = (userId, data) => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({
            userId,
            data
        });
    }, 1000)
});
fetchUser(1337)
    .then((data) => {
        console.log(data);
        return setUserData(data.userId, data);
    })
    .then((finishedData) => {
        console.log(finishedData);
        return new Promise((resolve, reject) => {
            reject('failed');
        })
    })
    .catch(err => {
        console.warn(err);
    })