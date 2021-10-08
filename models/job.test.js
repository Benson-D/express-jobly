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
    title: "test",
    salary: 100,
    equity: "0.1",
    companyHandle: "c2",
  };
  test("works", async function () {
    let job = await Job.create(newJob);

    expect(job).toEqual({
      id: job.id,
      title: "test",
      salary: 100,
      equity: "0.1",
      companyHandle: "c2",
    });

    const result = await db.query(
      `SELECT id, 
            title, salary, equity, 
            company_handle AS "companyHandle"
          FROM jobs
          WHERE id = $1`,
      [job.id]
    );
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "test",
        salary: 100,
        equity: "0.1",
        companyHandle: "c2",
      },
    ]);
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
        companyHandle: "c1",
      },
      {
        id: jobIds.Id2.id,
        title: "j2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
      },
      {
        id: jobIds.Id3.id,
        title: "j3",
        salary: 300,
        equity: "0.3",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works for jobs", async function () {
    let job = await Job.get(jobIds.Id1.id);

    expect(job).toEqual({
      id: jobIds.Id1.id,
      title: "j1",
      salary: 100,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /**************************************** search */
describe("search", function () {
  // TO DO: Update variable names to be more clear (i.e. valid vs. invalid)
  const dataToSearchValid = {
    title: "j",
    minSalary: 250,
    hasEquity: true,
  };

  const dataToSearchOne = {
    minSalary: 250,
  };

  const dataToSearchInvalid = {
    title: "j",
    maxEmployees: "3",
    name: "C2",
  };

  test("find one query", async function () {
    const response = await Job.search(dataToSearchOne);
    expect(response).toEqual([
      {
        id: jobIds.Id3.id,
        title: "j3",
        salary: 300,
        equity: "0.3",
        companyHandle: "c3",
      },
    ]);
  });

  test("find all queries", async function () {
    const response = await Job.search(dataToSearchValid);

    expect(response).toEqual([
      {
        id: jobIds.Id3.id,
        title: "j3",
        salary: 300,
        equity: "0.3",
        companyHandle: "c3",
      },
    ]);
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "j1",
    salary: 100,
    equity: "0.1",
  };

  test("works", async function () {
    let job = await Job.update(jobIds.Id2.id, updateData);
    expect(job).toEqual({
      id: job.id,
      ...updateData,
      companyHandle: "c2",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [job.id]
    );

    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c2",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: 300,
      equity: null,
    };

    let job = await Job.update(jobIds.Id1.id, updateDataSetNulls);
    expect(job).toEqual({
      id: job.id,
      ...updateDataSetNulls,
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [job.id]
    );
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "New",
        salary: 300,
        equity: null,
        companyHandle: "c1",
      },
    ]);
  });

  test("not found if no such ", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds.Id1.id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds.Id1.id);
    const res = await db.query(`SELECT id FROM jobs WHERE id=$1`, [
      jobIds.Id1.id,
    ]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
