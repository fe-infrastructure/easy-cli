import { resolve } from 'node:path'
import prompts from 'prompts'
import chalk from 'chalk'
import validatePkg from 'validate-npm-package-name'
import { readPackageSync } from 'read-pkg'
import parseArgs from 'minimist'

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

const cwd = process.cwd()

const args = parseArgs(process.argv.slice(2))
const isCurDir = args._.includes('.')

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

  // Get project root path
  const rootPath = isCurDir ? cwd : resolve(cwd, projectName)
  console.log(rootPath, 'rootPath')

  // Rename package.json name
  const tmpPkgPath = resolve(__dirname, `../templates/${framework}`)
  const pkg = readPackageSync({ cwd: tmpPkgPath })
  pkg.name = projectName
  console.log(pkg)
}

init().catch((err) => {
  console.log(err)
})
