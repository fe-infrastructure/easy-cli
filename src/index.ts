import { resolve } from 'node:path'
import prompts from 'prompts'
import chalk from 'chalk'
import validatePkg from 'validate-npm-package-name'
import { readPackageSync } from 'read-pkg'

const log = console.log

export interface ITemplateItem {
  title: string
  value: string
}

const templates: ITemplateItem[] = [
  {
    title: 'node',
    value: 'node'
  },
  {
    title: 'vue',
    value: 'vue'
  }
]

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
      choices: templates
    }
  ])

  const { framework, projectName } = result

  // Rename package.json name
  const tmpPkgPath = resolve(__dirname, `../templates/${framework}`)
  const pkg = readPackageSync({ cwd: tmpPkgPath })
  console.log(pkg)
}

init().catch((err) => {
  console.log(err)
})
