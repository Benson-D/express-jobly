"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require("./_testCommon");

// From _testCommon.js
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  let newJob = {
    title: 'test',
    salary: 100,
    equity: '0.1',
    company_handle: 'c2',
  }
  test("works", async function () {
    
    // const newJob = {
    //   title: 'test',
    //   salary: 100,
    //   equity: '0.1',
    //   company_handle: 'c2',
    // }
    console.log("newJob:", newJob);

    let job = await Job.create(newJob);
    console.log("job", job);
    expect(job).toEqual({
        id: job.id,
        title: "test",
        salary: 100,
        equity: 0.1,
        company_handle: "c2",
      });

    // const result = await db.query(
    //   `SELECT id, title, salary, equity, company_handle
    //        FROM jobs
    //        WHERE id = '${job.id}'`
    // );
    // expect(result.rows).toEqual([
    //   {
    //     id: job.id,
    //     title: "test",
    //     salary: 100,
    //     equity: 0.1,
    //     company_handle: "c2",
    //   },
    // ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: jobIds.Id1.id,
        title: "j1",
        salary: 100,
        equity: "0.1",
        company_handle: "c1",
      },
      {
        id: jobIds.Id2.id,
        title: "j2",
        salary: 200,
        equity: "0.2",
        company_handle: "c2",
      },
      {
        id: jobIds.Id3.id,
        title: "j3",
        salary: 300,
        equity: "0.3",
        company_handle: "c3",
      },
    ]);
  });
});

/************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     let company = await Company.get("c1");
//     expect(company).toEqual({
//       handle: "c1",
//       name: "C1",
//       description: "Desc1",
//       numEmployees: 1,
//       logoUrl: "http://c1.img",
//     });
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.get("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /**************************************** search */
// describe("search", function () {
//   // TO DO: Update variable names to be more clear (i.e. valid vs. invalid)
//   const dataToSearch = {
//     minEmployees: "300",
//     maxEmployees: "200",
//     name: "baker",
//   };

//   const dataToSearch2 = {
//     maxEmployees: "2",
//   };

//   const dataToSearch3 = {
//     minEmployees: "1",
//     maxEmployees: "3",
//     name: "C2",
//   };

//   test("minEmployee greater than maxEmployee", async function () {
//     try {
//       await Company.search(dataToSearch);
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//       // Expect error message... 
//     }
//   });

//   test("find one query", async function () {
//     const response = await Company.search(dataToSearch2);

//     expect(response).toEqual([
//       {
//         description: "Desc1",
//         handle: "c1",
//         logoUrl: "http://c1.img",
//         name: "C1",
//         numEmployees: 1,
//       },
//     ]);
//   });

//   test("find all queries", async function () {
//     const response = await Company.search(dataToSearch3);

//     expect(response).toEqual([
//       {
//         description: "Desc2",
//         handle: "c2",
//         logoUrl: "http://c2.img",
//         name: "C2",
//         numEmployees: 2,
//       },
//     ]);
//   });

//   test("find no queries", async function () {
//     try {
//       await Company.search({});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//       // Error message...
//     }
//   });

//   // TO DO: If additional filters added
// });

// /************************************** update */

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let company = await Company.update("c1", updateData);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`
//     );
//     expect(result.rows).toEqual([
//       {
//         handle: "c1",
//         name: "New",
//         description: "New Description",
//         num_employees: 10,
//         logo_url: "http://new.img",
//       },
//     ]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let company = await Company.update("c1", updateDataSetNulls);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`
//     );
//     expect(result.rows).toEqual([
//       {
//         handle: "c1",
//         name: "New",
//         description: "New Description",
//         num_employees: null,
//         logo_url: null,
//       },
//     ]);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.update("nope", updateData);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Company.update("c1", {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Company.remove("c1");
//     const res = await db.query(
//       "SELECT handle FROM companies WHERE handle='c1'"
//     );
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.remove("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
