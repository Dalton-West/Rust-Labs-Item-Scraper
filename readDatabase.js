'use strict';
const Datastore = require('nedb');

const itemCategories = ["weapons", "build", "items", "resources", "clothing", "tools", "medical", "food", "ammo", "traps", "misc", "components", "electrical", "fun"];

const database = new Datastore('item-dbs/' + itemCategories[0] + '.db');
database.loadDatabase();

console.log(database.find({}, (err) => {
    console.log(err);
}));
