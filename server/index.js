// imports here for express and pg
const express = require("express");
const app = express();
const path = require("path");
const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_notes_db"
);

// static routes here (you only need these for deployment)
// This line serves static files (like HTML, CSS, JavaScript) from a specified directory for deployment purposes. It helps serve the front end of the application.
app.use(express.static(path.join(__dirname, "../client/dist")));

// app routes here
// This sets up an API endpoint at /api/employees
app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
    SELECT * FROM employees;
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

// This sets up the home route, which serves the main HTML file when the root URL is accessed.
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);

// create your init function
// This asynchronous function connects to the database and prepares it
const init = async () => {
  await client.connect();
  const SQL = `
  DROP TABLE IF EXISTS employees;
  CREATE TABLE employees(
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  is_admin BOOLEAN DEFAULT FALSE
  );

  INSERT INTO employees(name) VALUES('Employee #1');
  INSERT INTO employees(name, is_admin) VALUES('Employee #2', true);
  INSERT INTO employees(name, is_admin) VALUES('Employee #3', false);
  `;
  await client.query(SQL);
  console.log("data seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

// init function invocation
init();
