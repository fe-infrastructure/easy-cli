import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copySync, existsSync, mkdirSync, readJsonSync, writeJsonSync } from 'fs-extra'
import prompts from 'prompts'
import chalk from 'chalk'
import validatePkg from 'validate-npm-package-name'
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

  // Get project template path
  const templatePath = resolve(dirname(fileURLToPath(import.meta.url)), `../templates/${framework}`)

  // Copy framework to project root path
  if (!existsSync(rootPath)) {
    mkdirSync(rootPath)
  }
  copySync(templatePath, rootPath)

  // Rename project package.json name
  const projectPkgPath = resolve(rootPath, 'package.json')
  const pkg = readJsonSync(projectPkgPath)
  pkg.name = projectName
  writeJsonSync(projectPkgPath, pkg, { spaces: 2 })

  // Tip install and start project
  if (!isCurDir) {
    log(chalk.blue(`cd ${projectName}`))
  }
  log(chalk.red('pnpm install'))
  log(chalk.green('pnpm dev'))
}

init().catch((err) => {
  console.log(err)
})
