const inquirer = require('inquirer');
const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');
const consoleTable = require('console.table');

const app = express();
app.use(express.json());

//Clear the screen
process.stdout.write("\u001b[2J\u001b[0;0H");

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

// function to view all employees
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
  start();
});
}

// function to view all roles
async function viewAllRoles() {
  // SQL Query
  let query =`SELECT roles.id AS 'Role ID', title AS 'Title', name AS 'Department',  salary AS 'Salary'
  FROM roles
  JOIN departments ON roles.department_id=departments.id`;
  //Query database
  db.query(query, function (err, results) {
    console.table(results);
    start();
  });
}

// function to view all departments
async function viewAllDepartments() {
  // SQL Query
  let query =`SELECT name AS 'Department', id AS 'Department ID' 
  FROM departments`;
  // Query database
  //db.query('SELECT * FROM departments', function (err, results) {
  db.query(query, function (err, results) {
  console.table(results);
  start();
  });
}

// function to view add an employee
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
     // lists all roles as choices for role
     choices: roles[0].map(role => ({name:role.title, value:role.id}))
   },
   {
     type: "list",
     name: "manager",
     message: "Manager: ",
     // lists all managers as choices for manager
     choices: managers[0].map(manager => ({name:manager.Manager, value:manager.id}))
   }
 ])
 .then(function({ first_name, last_name, role, manager }) {
   // store new employee into database
   db.query(`INSERT INTO employees SET ?`,[{first_name:first_name, last_name:last_name, role_id:role, manager_id:manager}]);
   start();
  });
}

// function to add a department
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
  // store department into database
 db.query(`INSERT INTO departments SET ?`,[{name:name}]);
 start();
});
}

// function to add a role
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
  // lists all the departments as choices for the role
  choices: departments[0].map(department => ({name:department.name, value:department.id}))
}
])
.then(function({title, salary, department}) {
  // inserts new role into database
 db.query(`INSERT INTO roles SET ?`,[{title:title, salary:salary, department_id:department}]);
 start();
});
}

// function to update employee role
async function updateEmployeeRole(employees,roles) {
  inquirer
.prompt([
{
  type: "list",
  name: "employee",
  message: "Employee: ",
  // lists all the employees as choices for employee to update the role
  choices: employees[0].map(employee => ({name:employee.Employee, value:employee.id}))
},
{
  type: "list",
  name: "name",
  message: "Role: ",
  // lists all the roles as choices for role for an employee
  choices: roles[0].map(role => ({name:role.title, value:role.id}))
}
])
.then(function({name, employee}) {
  // updates employee role in database
  let sql =`UPDATE employees SET role_id =${name} WHERE id = ${employee}`;
  db.query(sql);
  start();
});
}

// fuction to update employee manager
async function updateEmployeeManager(employees,managers) {
  inquirer
.prompt([
{
  type: "list",
  name: "employee",
  message: "Employee: ",
  // lists all employees as choices for an employee to update the manager
  choices: employees[0].map(employee => ({name:employee.Employee, value:employee.id}))
},
{
  type: "list",
  name: "manager",
  message: "Manager: ",
  // lists all the managers as choices for manager for an employee
  choices: managers[0].map(manager => ({name:manager.Manager, value:manager.id}))
}
])
.then(function({employee, manager}) {
  // updates an employee manager in database
  let sql =`UPDATE employees SET manager_id =${manager} WHERE id = ${employee}`;
  db.query(sql);
  start();
});
}

// function to view list of employees by manager
async function viewEmployeesByManager(employees,managers) {
  inquirer
.prompt([
{
  type: "list",
  name: "manager",
  message: "Manager: ",
  // lists all managers as choices of manager for employees to be listed
  choices: managers[0].map(manager => ({name:manager.Manager, value:manager.id}))
}
])
  .then(function({employee, manager}) {
    // SQL Query
    let query = `SELECT employee.id AS ID, employee.first_Name AS 'First Name', employee.last_Name AS 'Last Name', title AS 'Title', name AS 'Department', salary AS 'Salary'
    FROM employees employee
    JOIN roles ON employee.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    WHERE manager_id = ${manager}
    GROUP BY employee.id
    ORDER BY employee.id ASC`;
    // read and disply list of employees per manager
    db.query(query, function (err, results) {
      console.table(results);
      start();
    });
  });
}

// function to calculate total budgte per department
async function viewTotalBudget(employees,departments,roles) {
  inquirer
.prompt([
{
  type: "list",
  name: "department",
  message: "Department: ",
  // lists all departments as choices for the department
  choices: departments[0].map(department => ({name:department.name, value:department.id}))
}
])
  .then(function({employee, department, role}) {
    // SQL Query to calcualte the SUM
    let query = `SELECT SUM(salary) AS 'Total Department Budget'
    FROM employees
    JOIN roles ON role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    WHERE department_id = ${department}`;
    // calculate the SUM and display the result
    db.query(query, function (err, results) {
      console.table(results);
      start();
    });
  });
}

// function to view employees by department
async function viewEmployeesByDepartment(employees,departments,roles) {
  inquirer
.prompt([
{
  type: "list",
  name: "department",
  message: "Department: ",
  // lists all departments as choices for the department
  choices: departments[0].map(department => ({name:department.name, value:department.id}))
}
])
  .then(function({employee, department, role}) {
    // SQL Query
    let query = `SELECT employee.id AS ID, employee.first_Name AS 'First Name', employee.last_Name AS 'Last Name', title AS 'Title', name AS 'Department', salary AS 'Salary', GROUP_CONCAT(DISTINCT manager.first_Name,' ', manager.last_Name) AS 'Manager'
    FROM employees employee
    JOIN roles ON employee.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees manager ON employee.manager_id = manager.id
    WHERE department_id = ${department}
    GROUP BY employee.id
    ORDER BY employee.id ASC`;
    // reads list of employee filtered by depatment and display
    db.query(query, function (err, results) {
      console.table(results);
      start();
    });
  });
}

// function to delete a department
async function deleteDepartment(departments) {
  inquirer
.prompt([
{
  type: "list",
  name: "department",
  message: "Department: ",
  // lists all departments as choices for deleting a department
  choices: departments[0].map(department => ({name:department.name, value:department.id}))
}
])
  .then(function({department}) {
    // SQL Query - Delete a department from database
    let query = `DELETE FROM departments WHERE id = ${department}`;

    db.query(query, function (err, results) {
      start();
    });
  });
}

// delete a role from database
async function deleteRole(roles) {
  inquirer
.prompt([
  {
    type: "list",
    name: "name",
    message: "Role: ",
    // lists all roles as choices of role to be deleted
    choices: roles[0].map(role => ({name:role.title, value:role.id}))
  }
])
  .then(function({name}) {
    // SQL Query - delete selected role from database
    let query = `DELETE FROM roles WHERE id = ${name}`;

    db.query(query, function (err, results) {
      start();
    });
  });
}

// function to delete an employee from database
async function deleteEmployee(employees) {
  inquirer
.prompt([
  {
    type: "list",
    name: "employee",
    message: "Employee: ",
    // lists all employee as choices for employee to be deleted 
    choices: employees[0].map(employee => ({name:employee.Employee, value:employee.id}))
  }
])
  .then(function({employee}) {
    // SQL Query - deletes an employee from database
    let query = `DELETE FROM employees WHERE id = ${employee}`;

    db.query(query, function (err, results) {
      start();
    });
  });
}

// main menu and all availabe options to be selected
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
        { name: "View employees by manager", value: "view_employees_by_manager" },
        { name: "View employees by department", value: "view_employees_by_department" },
        { name: "View total department budget", value: "view-total-budget" },
        { name: "Add a dempartment", value: "add-department" },
        { name: "Add a role", value: "add-role"},
        { name: "Add an employee", value: "add-employee" },
        { name: "Delete a dempartment", value: "delete-department" },
        { name: "Delete a role", value: "delete-role" },
        { name: "Delete an employee", value: "delete-employee" },
        { name: "Update employee role", value: "update-employee-role" },
        { name: "Update employee manager", value: "update-employee-manager" },
        { name: "Quit", value: "quit"}
      ]
    }
  ];
  return inquirer.prompt(questions);
};

// The main loop starting initially and every time a task finished
const start = async () => {
  let all_departments;
  let all_roles;
  let all_managers;
  try {
    // reads all available departments
    all_departments = await db.promise().query('SELECT * from departments')
    // reads all available roles
    all_roles = await db.promise().query('SELECT * from roles')
    // reads all available employees
    all_employees = await db.promise().query('SELECT CONCAT(first_name, " ", last_name) AS Employee, id from employees')
    // reads all employees and creates list of all managers
    all_managers = await db.promise().query('SELECT CONCAT(first_name, " ", last_name) AS Manager, id FROM employees WHERE manager_id IS NULL')
  } catch (error) {
      console.log(error)
  }
  // main menu waits for any selection by user
  await mainMenu()
  // differnt function calls based on user selections
  .then(answers => {
    switch (answers.action) {
      case ("view_all_employees"):{
        viewAllEmployees();
        break;
      }
      case ("view_employees_by_manager"):{
        viewEmployeesByManager(all_employees,all_managers);
        break;
      }
      case ("view_employees_by_department"):{
        viewEmployeesByDepartment(all_employees,all_departments,all_roles);
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
      case ("update-employee-manager"):{
        updateEmployeeManager(all_employees, all_managers);
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
      case ("view-total-budget"):{
        viewTotalBudget(all_employees,all_departments,all_roles);
        break;
      }
      case ("add-department"):{
        addDepartment(all_departments);
        break;
      }      
      case ("delete-role"):{
        deleteRole(all_roles);
        break;
      }       
      case ("delete-department"):{
        deleteDepartment(all_departments);
        break;
      }       
      case ("delete-employee"):{
        deleteEmployee(all_employees);
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

start()