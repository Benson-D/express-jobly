"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "j3",
    salary: 300,
    equity: 0.3,
    companyHandle: "c2",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    console.log("resp inside POST /jobs:", resp.body);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: resp.body.job.id,
        ...newJob,
        equity: "0.3",
      }
    });
  });

  test("not ok for user", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "j2",
        salary: 200,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: null,
        salary: "200",
        equity: 0.2,
        company_handle: "c0",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: jobIds.job1,
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: jobIds.job2,
          title: "j2",
          salary: 200,
          equity: "0.2",
          companyHandle: "c2",
        },
      ],
    });
  });

  // test("find one query", async function () {
  //   const resp = await request(app)
  //     .get("/jobs")
  //     .query({ maxEmployees: 2 });

  //   expect(resp.body).toEqual({
  //     jobs: [
  //       {
  //         description: "Desc1",
  //         handle: "c1",
  //         logoUrl: "http://c1.img",
  //         name: "C1",
  //         numEmployees: 1,
  //       },
  //     ],
  //   });
  // });

  // test("find all queries", async function () {
  //   const resp = await request(app)
  //     .get("/jobs")
  //     .query({ minEmployees: 1, maxEmployees: 3, name: "C2" });

  //   expect(resp.body).toEqual({
  //     jobs: [
  //       {
  //         description: "Desc2",
  //         handle: "c2",
  //         logoUrl: "http://c2.img",
  //         name: "C2",
  //         numEmployees: 2,
  //       },
  //     ],
  //   });
  // });

  // test("invalid min max Employee request", async function () {
  //   const resp = await request(app)
  //     .get("/jobs")
  //     .query({ minEmployees: 10, maxEmployees: 1 });

  //   expect(resp.statusCode).toEqual(400);
  // });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobIds.job1}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds.job1,
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds.job1}`)
      .send({
        title: "j1 updated",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds.job1,
        title: "j1 updated",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for user", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds.job2}`)
      .send({
        title: "j2 updated",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/${jobIds.job2}`).send({
      title: "j2 tried to update",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "no job",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds.job2}`)
      .send({
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds.job2}`)
      .send({
        title: null,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds.job2}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${jobIds.job2}` });
  });

  test("unauth for user", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds.job1}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/${jobIds.job1}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});


