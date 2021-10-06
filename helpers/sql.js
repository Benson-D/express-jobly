const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/** Function recieves two objects, returns a new object
 *
 * return {
 *    setCols: "first_name=$1, age=$2",
 *    values: [Aliya, 32]
 *    };
 *
 * */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  // Takes actual column name from the sql
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Function receives two objects, returns a new object
 *
 * return {
 *    minEmployees: `num_employees > $${idx+1}`,
 *    maxEmployees: `num_employees < $${idx+1}`,
 *    names: ``
 *    values: [${dataToSearch.minEmployees}, 
 *              ${dataToSearch.maxEmployees}, 
 *              ${dataToSearch.names}]
 *    };
 *
 * */

 function sqlForSearch(dataToSearch, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  const { searchMinEmployees, searchMaxEmployees, searchNames } = dataToUpdate;
  if (keys.length === 0) throw new BadRequestError("No data");

  if (searchMinEmployees) {
    `$"${jsToSql[colName] || colName}"`
  }

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  // Takes actual column name from the sql
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
