const inquirer = require('inquirer');
const util = require('util')

// Clear the screen
process.stdout.write("\u001b[2J\u001b[0;0H");

const mainMenu = () => {
  const questions = [
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        { name: "Employee - View All", value: "view" },
        { name: "Employee - Add", value: "add" },
        { name: "Employee - Update Role", value: "edit" },
        { name: "Roles - View All", value: "delete" },
        { name: "Roles - Add", value: "exit"},
        { name: "Department - View All - Update Role", value: "edit" },
        { name: "Department - Add", value: "delete" },
        { name: "Quit", value: "quit"}
      ]
    }
  ];
  return inquirer.prompt(questions);
};

const init = async () => {
    await mainMenu()
    .then(answers => {
      if (answers.action === 'Action1') {
        return Promise.resolve('hello world');
      }
      else if (answers.action === 'Action2') {
        return new Promise((resolve, reject) => {
          inquirer
            .prompt([
              {
                type: 'input',
                name: 'secretCode',
                message: "Enter a secret code:"
              }
            ])
            .then(answers => {
              resolve(answers);
            })
        });
      }
      else {
        console.log('Exiting program.')
        process.exit(0);
      }
    })
    .then((data) => { console.log(util.inspect(data, { showHidden: false, depth: null })); })
    .catch((error, response) => {
      console.error('Error:', error);
    });
}

init()