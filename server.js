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
  let query =`SELECT title AS 'Title', name AS 'Department',  salary AS 'Salary'
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
        { name: "Employee - View All", value: "view_all_employees" },
        { name: "Employee - Add", value: "add-employee" },
        { name: "Employee - Update Role", value: "edit-employee-role" },
        { name: "Roles - View All", value: "view-all-roles" },
        { name: "Roles - Add", value: "add-role"},
        { name: "Roles - Update", value: "update-role"},
        { name: "Department - View All", value: "view-all-departments" },
        { name: "Department - Add", value: "add-department" },
        { name: "Quit", value: "quit"}
      ]
    }
  ];
  return inquirer.prompt(questions);
};

// function addEmployee() {
//   inquirer
//     .prompt([
//       {
//         type: "input",
//         message: "First name of employee?",
//         name: "first_name"
//       },
//       {
//         type: "input",
//         message: "Last name of employee?",
//         name: "last_name"
//       },
//       {
//         type: "list",
//         message: "role of employee?",
//         name: "role",
//         choices: [
//           "Sales Lead",
//           "Salesperson",
//           "Lead Engineer",
//           "Software Engineer",
//           "Accountant",
//           "Legal Team Lead",
//           "Lawyer"
//         ]
//       }
//     ])
//     .then(function({ first_name, last_name, role, manager }) {
//       switch (role) {
//         case "Sales Lead":
//           var role = "1";
//           var manager = "Ashley Rodriguez";
//           break;
//         case "Salesperson":
//           var role = "2";
//           var manager = "John Doe";
//           break;
//         case "Lead Engineer":
//           var role = "3";
//           var manager = "null";
//           break;
//         case "Software Engineer":
//           var role = "4";
//           var manager = "Ashley Rodriguez";
//           break;
//         case "Accountant":
//           var role = "5";
//           var manager = "null";
//           break;
//         case "Legal Team Lead":
//           var role = "6";
//           var manager = "null";
//           break;
//         case "Lawyer":
//           var role = "7";
//           var manager = "Sarah Lourd";
//           break;
//         default:
//           break;
//       }
//       db.query(
//         `INSERT INTO employees (first_name, last_name, role_id, manager) VALUES ('${first_name}', '${last_name}', '${role}', '${manager}');`,
//         function(err, result) {
//           if (err) throw err;
//           init();
//         }
//       );
//     });
// }




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

const init = async () => {
  let all_departments;
  let all_roles;
  let all_managers;
  try {
      all_departments = await db.promise().query('SELECT * from departments')
      all_roles = await db.promise().query('SELECT * from roles')
//      all_managers = await db.promise().query('SELECT * from employees')
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
      case ("edit-employee-role"):{
        break;
      }
      case ("view-all-roles"):{
        viewAllRoles();
        break;
      }
      case ("add-role"):{
        break;
      }
      case ("view-all-departments"):{
        viewAllDepartments();
        break;
      }
      case ("add-department"):{
        break;
      }      
      case ("quit"):{
        break;
      }
    }        
  })
  .catch((error, response) => {console.error('Error:', error);});
  };

init()