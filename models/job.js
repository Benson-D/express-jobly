"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

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
          company_handle AS "companyHandle"
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

  /** Given an object with title, minSalary or hasEquity
   *  Returns an object, one of where claus's and one of values
   *
   * Returns : {
   *    where: title ILIKE $1 AND salary > $2, equity > 0
   *    values: ["%title%", 20]
   * }
   *
   */

  static sqlForSearch(dataToSearch) {
    // If there is a search for name, format the name to be SQL friendly

    if (dataToSearch.title) {
      dataToSearch.title = `%${dataToSearch.title}%`;
    }

    // Checks if there is a title, minSalary and/or hasEquity
    // Creates a string that can be used for a SQL query
    // adds the string to an array called whereSql
    const { title, minSalary, hasEquity } = dataToSearch;

    let whereTitle, whereMinSalary, whereHasEquity;
    const whereSql = [];
    const values = [];
    // Create another array of values and push into it and get the length

    if (title) {
      values.push(title);
      whereTitle = `title ILIKE $${values.length}`;
      whereSql.push(whereTitle);
    }

    if (minSalary) {
      values.push(minSalary);
      whereMinSalary = `salary > $${values.length}`;
      whereSql.push(whereMinSalary);
    }

    if (hasEquity) {
      whereHasEquity = `equity > 0`;
      whereSql.push(whereHasEquity);
    }

    // Convert whereSql into a string combined with AND so that it's
    // SQL query friendly
    const where = whereSql.join(" AND ");

    return {
      where,
      values,
    };
  }

  /**
   *
   * Function returns an array of jobs that fit the criteria
   *
   * Returns: [{
   *        id: 1,
   *        title: "j1",
   *        salary: 100,
   *        equity: "0.1",
   *        companyHandle: "c1",
   *      }]
   */

  static async search(searchValues) {
    console.log(searchValues, "search values");

    const { where, values } = this.sqlForSearch(searchValues);
    console.log(where, "where clause");
    console.log([...values], "values");

    const querySql = `
      SELECT id, title,
        salary, 
        equity,
        company_handle AS "companyHandle"
        FROM jobs
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
