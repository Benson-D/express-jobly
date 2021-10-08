const { BadRequestError } = require("../expressError");

/** Function takes in two objects:
 *    First object: key=value pairs of column name and update value
 *          { minEmployees: 10, maxEmployees: 100, name: baker }
 * 
 *    Second object: key=value pairs of JSNames and SQL names
 *          {  numEmployees: "num_employees", logoUrl: "logo_url"}
 *
 * returns: {
 *    setCols: "first_name=$1, age=$2",
 *    values: [Aliya, 32]
 *    };
 *
 * */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Function takes an object with search criteria
 *  for minEmployees and/or maxEmployees and/or name
 *  { minEmployees: 10, maxEmployees: 50, name: baker }
 *
 * returns: {
 *    where: `num_employees > $1
 *        AND num_employees < $2
 *        AND name LIKE $3`,
 *    values: ['10', '500', '%baker%']
 *  };
 * */

// TO DO: Move to company.js model
function sqlForByNumEmployeesOrName(dataToSearch) {
  // If there are no keys in the object, return a BadRequestError
  const keys = Object.keys(dataToSearch);
  if (keys.length === 0) throw new BadRequestError("No data");
  console.log("keys:", keys);

  // If there is a search for name, format the name to be SQL friendly
  if (dataToSearch.name) {
    dataToSearch.name = `%${dataToSearch.name}%`;
  }

  // Checks if there is a minEmployee, maxEmployee and/or name
  // Creates a string that can be used for a SQL query
  // adds the string to an array called whereSql
  const { minEmployees, maxEmployees, name } = dataToSearch;

  let whereMin, whereMax, whereName;
  const whereSql = [];
  // Create another array of values and push into it and get the length

  if (minEmployees) {
    whereMin = `num_employees > $${keys.indexOf("minEmployees") + 1}`;
    whereSql.push(whereMin);
  }

  if (maxEmployees) {
    whereMax = `num_employees < $${keys.indexOf("maxEmployees") + 1}`;
    whereSql.push(whereMax);
  }

  if (name) {
    whereName = `name LIKE $${keys.indexOf("name") + 1}`;
    whereSql.push(whereName);
  }

  // Convert whereSql into a string combined with AND so that it's
  // SQL query friendly
  const where = whereSql.join(" AND ");

  return {
    where,
    values: Object.values(dataToSearch),
  };
}

module.exports = { sqlForPartialUpdate, sqlForByNumEmployeesOrName };
