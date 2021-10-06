const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

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


