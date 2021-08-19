const inquirer = require('inquirer');
const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');

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

async function viewAllEmployees() {
  // Query database
//  db.query('SELECT * FROM employees', function (err, results) {
    db.query('SELECT employees.id, employees.first_name, employees.last_name, roles.title AS title JOIN employees.role_id=department.id', function (err, results) {
      console.table(results);
    init();
  });
}

async function viewAllRoles() {
  // Query database
  db.query('SELECT * FROM roles', function (err, results) {
    console.table(results);
    init();
  });
}

async function viewAllDepartments() {
  // Query database
  db.query('SELECT * FROM departments', function (err, results) {
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

const init = async () => {
    await mainMenu()
    .then(answers => {
      switch (answers.action) {
        case ("view_all_employees"):{
          viewAllEmployees();
          break;
        }
        case ("add-employee"):{
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
    // .catch((error, response) => {
    //   console.error('Error:', error);
    // });
    };

init()