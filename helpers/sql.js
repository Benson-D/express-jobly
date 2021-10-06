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
 *    whereMin: `num_employees > $${idx+1}`,
 *    whereMax: `num_employees < $${idx+1}`,
 *    whereName: `ILIKE %names%`
 *    values: [${dataToSearch.minEmployees},
 *              ${dataToSearch.maxEmployees},
 *              ${dataToSearch.names}]
 *    };
 *
 * */

function sqlForSearch(dataToSearch) {
  const keys = Object.keys(dataToSearch);
  const { minEmployees, maxEmployees, name } = dataToSearch;

  if (keys.length === 0) throw new BadRequestError("No data");

  let whereMin, whereMax, whereName;
  const whereSql = [];

  if (minEmployees) {
    whereMin = `num_employees > $${keys.indexOf(minEmployees)}`;
    whereSql.push({ whereMin });
  }

  if (maxEmployees) {
    whereMax = `num_employees > $${keys.indexOf(maxEmployees)}`;
    whereSql.push({ whereMax });
  }

  if (name) {
    whereName = `ILIKE %${name}%`;
    whereSql.push({ whereName });
  }

  const where = whereSql.join(" AND ");

  return {
    where,
    values: Object.values(dataToSearch),
  };
}

module.exports = { sqlForPartialUpdate, sqlForSearch };
