"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
  sqlForPartialUpdate,
  sqlForByNumEmployeesOrName,
} = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {
    // const duplicateCheck = await db.query(
    //   `SELECT handle
    //        FROM companies
    //        WHERE handle = $1`,
    //   [handle]
    // );

    // if (duplicateCheck.rows[0])
    //   throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO jobs(
          title,
          salary,
          equity,
          company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const jobResults = await db.query(
      `SELECT id,
          title,
          salary,
          equity,
          company_handle
           FROM jobs
           ORDER BY id`
    );
    return jobResults.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobResult = await db.query(
      `SELECT id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [id]
    );

    const job = jobResult.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Given an object with minEmployees, maxEmployees or name
   *  Returns an array of companies that fit the criteria.
   *  Throws an error if there is fault logic in Min and Max
   *  Employees.
   *
   *  Returns: [{
   *     description: "Desc1",
   *     handle: "c1",
   *     logoUrl: "http://c1.img",
   *     name: "C1",
   *     numEmployees: 1,
   *   },...]
   */

  // static async search(searchValues) {
  //   if (Number(searchValues.minEmployees) > Number(searchValues.maxEmployees)) {
  //     throw new BadRequestError("Invalid Request");
  //   }
  //   console.log(searchValues, "search values");

  //   const { where, values } = sqlForByNumEmployeesOrName(searchValues);
  //   console.log(where, "where clause");
  //   console.log([...values], "values");

  //   const querySql = ` 
  //     SELECT handle, name, 
  //       description, num_employees AS "numEmployees", 
  //       logo_url AS "logoUrl"
  //       FROM companies
  //       WHERE ${where}
  //      `;

  //   console.log(querySql, "query");
  //   const result = await db.query(querySql, [...values]);
  //   console.log(result, "result");

  //   return result.rows;
  // }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);
  }
}

module.exports = Job;
