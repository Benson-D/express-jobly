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

  static async create({ title, salary, equity, company_handle }) {
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
           RETURNING id, title, salary, equity, companyHandle AS "companyHandle"`,
      [handle, name, description, numEmployees, logoUrl]
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
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No job: ${id}`);

    return company;
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
  // TO DO: Update .findAll() to take in req.query that can search
  static async search(searchValues) {
    if (Number(searchValues.minEmployees) > Number(searchValues.maxEmployees)) {
      throw new BadRequestError("Invalid Request");
    }
    console.log(searchValues, "search values");

    const { where, values } = sqlForByNumEmployeesOrName(searchValues);
    console.log(where, "where clause");
    console.log([...values], "values");

    const querySql = ` 
      SELECT handle, name, 
        description, num_employees AS "numEmployees", 
        logo_url AS "logoUrl"
        FROM companies
        WHERE ${where}
       `;

    console.log(querySql, "query");
    const result = await db.query(querySql, [...values]);
    console.log(result, "result");

    return result.rows;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);

    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
