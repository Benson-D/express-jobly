const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForSearch} = require("./sql");

/**  */

describe("Create partial update", function () {
  const data = {
    "name": "apple", 
    "description": "tech company", 
    "num_employees": "2"};

  const data2 = {};
  
  const jsToSql = {
    "numEmployees": "num_employees"
  }

  test("works, valid object return", function () {
    const result = sqlForPartialUpdate(data, jsToSql);

    expect(result).toEqual({
      setCols: "\"name\"=$1, \"description\"=$2, \"num_employees\"=$3",
      values: ['apple', 'tech company', '2']
    });
  });

  test("no data in dataObject, return error", function () {
    try {
      const result = sqlForPartialUpdate(data2, jsToSql);
    } catch (err) {
      expect (err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("Create sql", function () {
  const dataToSearch = {
    "minEmployees": "10", 
    "maxEmployees": "500", 
    "name": "baker"};

  const dataToSearch2 = {
    "minEmployees": "10", 
    "name": "baker"
  };

  const dataToSearch3 = {
    "minEmployees": "10"
  };

  const dataToSearch4 = {};

  test("works with three inputs", function () {
    const result = sqlForSearch(dataToSearch);

    expect(result).toEqual({
      where: `num_employees > $1 AND num_employees > $2 AND ILIKE %$3%`,
      values: ['10', '500', 'baker']
      });
  });

  test("works with two inputs", function () {
    const result = sqlForSearch(dataToSearch2);

    expect(result).toEqual({
      where: `num_employees > $1 AND ILIKE %$2%`,
      values: ['10', 'baker']
      });
  });

  test("works with one input", function () {
    const result = sqlForSearch(dataToSearch3);

    expect(result).toEqual({
      where: `num_employees > $1`,
      values: ['10']
      });
  });

  test("works with no inputs", function () {
    try {
      const result = sqlForSearch(dataToSearch4);
    } catch (err) {
      expect (err instanceof BadRequestError).toBeTruthy();
    }
  });
});