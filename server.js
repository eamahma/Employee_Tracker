const inquirer = require('inquirer');
const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');
const consoleTable = require('console.table');

const app = express();
app.use(express.json());




// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: 'HereYouGo',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);

async function viewAllEmployees(req, res) {
  // SQL Query
  let query = `SELECT employee.id AS ID, employee.first_Name AS 'First Name', employee.last_Name AS 'Last Name', title AS 'Title', name AS 'Department', salary AS 'Salary', GROUP_CONCAT(DISTINCT manager.first_Name,' ', manager.last_Name) AS 'Manager'
  FROM employees employee
  JOIN roles ON employee.role_id = roles.id
  JOIN departments ON roles.department_id = departments.id
  LEFT JOIN employees manager ON employee.manager_id = manager.id
  GROUP BY employee.id
  ORDER BY employee.id ASC`;
  
  // Query database
  db.query(query, function (err, results) {
  console.table(results);
  init();
});
}

async function viewAllRoles() {
  // SQL Query
  let query =`SELECT roles.id AS 'Role ID', title AS 'Title', name AS 'Department',  salary AS 'Salary'
  FROM roles
  JOIN departments ON roles.department_id=departments.id`;
  //Query database
  db.query(query, function (err, results) {
    console.table(results);
    init();
  });
}


async function viewAllDepartments() {
  // SQL Query
  let query =`SELECT name AS 'Department', id AS 'Department ID' 
  FROM departments`;
  // Query database
  //db.query('SELECT * FROM departments', function (err, results) {
  db.query(query, function (err, results) {
  console.table(results);
  init();
  });
}

//Clear the screen
process.stdout.write("\u001b[2J\u001b[0;0H");

const mainMenu = () => {
  const questions = [
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        { name: "View all departments", value: "view-all-departments" },
        { name: "View all roles", value: "view-all-roles" },
        { name: "View all employees", value: "view_all_employees" },
        { name: "Add a dempartment", value: "add-department" },
        { name: "Add a role", value: "add-role"},
        { name: "Add an employee", value: "add-employee" },
        { name: "Update employee role", value: "update-employee-role" },
        { name: "Quit", value: "quit"}
      ]
    }
  ];
  return inquirer.prompt(questions);
};

async function addEmployee(roles, departments, managers) {
    inquirer
  .prompt([
   {
     type: "input",
     name: "first_name",
     message: "First name: "
   },
   {
     type: "input",
     name: "last_name",
     message: "Last name: "
   }, 
   {
     type: "list",
     name: "role",
     message: "Employee role: ",
     choices: roles[0].map(role => ({name:role.title, value:role.id}))
   },
   {
     type: "list",
     name: "manager",
     message: "Manager: ",
     choices: managers[0].map(manager => ({name:manager.Manager, value:manager.id}))
   }
 ])
 .then(function({ first_name, last_name, role, manager }) {
   db.query(`INSERT INTO employees SET ?`,[{first_name:first_name, last_name:last_name, role_id:role, manager_id:manager}]);
   init();
  });
}

async function addDepartment(departments) {
  inquirer
.prompt([
 {
   type: "input",
   name: "name",
   message: "Department name: "
 }
])
.then(function({name}) {
 db.query(`INSERT INTO departments SET ?`,[{name:name}]);
 init();
});
}

async function addRole(roles, departments) {
  inquirer
.prompt([
 {
   type: "input",
   name: "title",
   message: "Role title: "
 },
 {
  type: "input",
  name: "salary",
  message: "Salary: "
},
{
  type: "list",
  name: "department",
  message: "Department: ",
  choices: departments[0].map(department => ({name:department.name, value:department.id}))
}
])
.then(function({title, salary, department}) {
 db.query(`INSERT INTO roles SET ?`,[{title:title, salary:salary, department_id:department}]);
 init();
});
}

async function updateEmployeeRole(employees,roles) {
  inquirer
.prompt([
{
  type: "list",
  name: "employee",
  message: "Employee: ",
  choices: employees[0].map(employee => ({name:employee.Employee, value:employee.id}))
},
{
  type: "list",
  name: "name",
  message: "Role: ",
  choices: roles[0].map(role => ({name:role.title, value:role.id}))
}
])
.then(function({name, employee}) {
  let sql =`UPDATE employees SET role_id =${name} WHERE id = ${employee}`;
//  db.query(`UPDATE employees SET WHERE ?`,[{id:employee, role_id:name}]);
  db.query(sql);
  init();
});
}

const init = async () => {
  let all_departments;
  let all_roles;
  let all_managers;
  try {
      all_departments = await db.promise().query('SELECT * from departments')
      all_roles = await db.promise().query('SELECT * from roles')
      all_employees = await db.promise().query('SELECT CONCAT(first_name, " ", last_name) AS Employee, id from employees')
      all_managers = await db.promise().query('SELECT CONCAT(first_name, " ", last_name) AS Manager, id FROM employees WHERE manager_id IS NULL')
  } catch (error) {
      console.log(error)
  }
  await mainMenu()
  .then(answers => {
    switch (answers.action) {
      case ("view_all_employees"):{
        viewAllEmployees();
        break;
      }
      case ("add-employee"):{
        addEmployee(all_roles, all_departments,all_managers);
        break;
      }
      case ("update-employee-role"):{
        updateEmployeeRole(all_employees, all_roles);
        break;
      }
      case ("view-all-roles"):{
        viewAllRoles();
        break;
      }
      case ("add-role"):{
        addRole(all_roles, all_departments);
        break;
      }
      case ("view-all-departments"):{
        viewAllDepartments();
        break;
      }
      case ("add-department"):{
        addDepartment(all_departments);
        break;
      }      
      case ("quit"):{
        db.end();
        break;
      }
    }        
  })
  .catch((error, response) => {console.error('Error:', error);});
  };

init()