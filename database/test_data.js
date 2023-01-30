const { faker } = require('@faker-js/faker');
const Database = require('better-sqlite3');
const fs = require("fs");

// MAKE DATA FOR poc.db (run `node test_data.js` to add data to poc.db.
// Make sure that the tables of poc.db are empty)
const db = new Database('poc.db');
const schema = fs.readFileSync('poc_schema.sql', 'utf8');
db.exec(schema);

function createPerson() {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const person = {
        fname: firstName,
        lname: lastName,
        phone: faker.phone.number("###-###-####"),
        email: faker.internet.email(firstName, lastName),
        street: `${faker.address.buildingNumber()} ${faker.address.street()}`,
        church: `${faker.word.adjective()} ${faker.word.noun()} church`
    }
    return(person);
};

function fiftyPeople () {
    const people = [];
    for (let i = 0; i < 50; i++) {
        people.push(createPerson())
    };
    return(people);
};

const insVol = db.prepare("INSERT INTO volunteers (fname, lname, phone, email, street, church) VALUES (@fname, @lname, @phone, @email, @street, @church)");

const insStu = db.prepare("INSERT INTO students (fname, lname, phone, email, street, church) VALUES (@fname, @lname, @phone, @email, @street, @church)");

const insVolMany = db.transaction((people) => {
    for (const person of people) insVol.run(person);
});

const insStudMany = db.transaction((people) => {
    for (const person of people) insStu.run(person);
});

insVolMany(fiftyPeople());
insStudMany(fiftyPeople());

const insRel = db.prepare("INSERT INTO relationships (mentor_id, student_id, stage) VALUES (@mentor_id, @student_id, @stage)");
const insRelMany = db.transaction((rels) => {
    for (const rel of rels) insRel.run(rel);
});

insRelMany([
    { mentor_id: 1, student_id: 50, stage: "connected" },
    { mentor_id: 2, student_id: 49, stage: "connected" },
    { mentor_id: 3, student_id: 48, stage: "connected" },
    { mentor_id: 4, student_id: 47, stage: "connected" },
    { mentor_id: 5, student_id: 46, stage: "connected" },
    { mentor_id: 6, student_id: 45, stage: "connected" },
    { mentor_id: 7, student_id: 44, stage: "connected" },
    { mentor_id: 8, student_id: 43, stage: "connected" },
    { mentor_id: 9, student_id: 42, stage: "connected" },
    { mentor_id: 10, student_id: 41, stage: "building" },
    { mentor_id: 11, student_id: 40, stage: "building" },
    { mentor_id: 12, student_id: 39, stage: "life-on-life" },
    { mentor_id: 13, student_id: 38, stage: "building" },
    { mentor_id: 14, student_id: 37, stage: "life-on-life" },
    { mentor_id: 15, student_id: 36, stage: "building" },
    { mentor_id: 16, student_id: 35, stage: "building" },
    { mentor_id: 17, student_id: 34, stage: "connected"},
    { mentor_id: 18, student_id: 33, stage: "connected"},
    { mentor_id: 19, student_id: 32, stage: "connected"},
    { mentor_id: 20, student_id: 31, stage: "connected"},
    { mentor_id: 21, student_id: 30, stage: "life-on-life"},
    { mentor_id: 22, student_id: 29, stage: "connected"},
    { mentor_id: 23, student_id: 28, stage: "connected"},
    { mentor_id: 24, student_id: 27, stage: "connected"},
    { mentor_id: 25, student_id: 26, stage: "connected"},
    { mentor_id: 25, student_id: 25, stage: "building"},
    { mentor_id: 24, student_id: 24, stage: "connected"},
    { mentor_id: 23, student_id: 23, stage: "life-on-life"},
    { mentor_id: 22, student_id: 22, stage: "life-on-life"},
    { mentor_id: 21, student_id: 21, stage: "connected"},
    { mentor_id: 21, student_id: 20, stage: "building"},
    { mentor_id: 22, student_id: 19, stage: "life-on-life"}
]);