import prompts from 'prompts'
import chalk from 'chalk'
import validatePkg from 'validate-npm-package-name'

const log = console.log

const templates = []

async function init () {
  const result = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name',
      validate: (value) => {
        const { validForNewPackages, validForOldPackages, errors, warnings } = validatePkg(value)
        if (validForNewPackages || validForOldPackages) return true
        return (errors || warnings || 'Invalid package.json name').toString()
      }
    },
    {
      type: 'select',
      name: 'framework',
      message: 'Select a framework',
      choices: []
    }
  ])
  log(chalk.blue(JSON.stringify(result)), 'result')
}

init().catch((err) => {
  console.log(err)
})
