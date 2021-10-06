const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

/**  */

describe("Create partial update", function () {
  test("works, valid object return", function () {
    const result = sqlForPartialUpdate({
      name: "",
      description: "",
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });

    expect(result).toEqual({
      setCol: "name=$1, description=$2, num_employees=$3, logo_url=$4",
      values: ["num_employees", "logo_url"],
    });
  });
});

// {name: dan, description: "music", numEmployees=2, logoUrl=""}
