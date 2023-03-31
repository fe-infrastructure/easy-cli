import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { intro, text, select, outro } from '@clack/prompts'
import color from 'picocolors'
import validatePkg from 'validate-npm-package-name'
import parseArgs from 'minimist'
import boxen from 'boxen'

const { copySync, existsSync, mkdirSync, readJsonSync, writeJsonSync, readFileSync, writeFileSync } = fs

const log = console.log

const replacePkgName = (str: string, pkgName: string) => {
  return str.replace('pkg-name', pkgName)
}

export interface ITemplateItem {
  label: string
  value: string
}

const templates: ITemplateItem[] = [
  {
    label: 'node',
    value: 'node'
  },
  {
    label: 'vue',
    value: 'vue'
  },
  {
    label: 'uni-app',
    value: 'uni-app'
  }
]

const cwd = process.cwd()

const args = parseArgs(process.argv.slice(2))
const isCurDir = args._.includes('.')

async function main () {
  log()
  intro(color.bgBlue(' create-app '))

  const projectName = (await text({
    message: 'Project name',
    placeholder: 'Enter project name',
    validate: (value) => {
      const { validForNewPackages, validForOldPackages, errors, warnings } = validatePkg(value)
      if (validForNewPackages || validForOldPackages) return
      return (errors || warnings || 'Invalid package.json name').toString()
    }
  })).toString()

  const framework = (await select({
    message: 'Select a framework',
    options: templates
  })).toString()

  // Get project root path
  const rootPath = isCurDir ? cwd : resolve(cwd, projectName)

  // Get project template path
  const templatePath = resolve(dirname(fileURLToPath(import.meta.url)), `../templates/${framework}`)

  // Copy framework to project root path
  if (!existsSync(rootPath)) {
    mkdirSync(rootPath)
  }
  copySync(templatePath, rootPath)

  // Rename package.json pkg-name
  const projectPkgPath = resolve(rootPath, 'package.json')
  const pkg = readJsonSync(projectPkgPath)
  pkg.name = projectName
  pkg.homepage = replacePkgName(pkg.homepage, projectName)
  pkg.repository.url = replacePkgName(pkg.repository.url, projectName)
  pkg.bugs = replacePkgName(pkg.bugs, projectName)
  writeJsonSync(projectPkgPath, pkg, { spaces: 2 })

  // Rename readme.md pkg-name
  const readmePath = resolve(rootPath, 'README.md')
  const readmeContent = readFileSync(readmePath, { encoding: 'utf-8' })
  writeFileSync(readmePath, replacePkgName(readmeContent, projectName))

  // End creation
  outro('End creation and start using!')

  // Tip install and start project
  let template = ''
  if (!isCurDir) {
    template += `cd ${projectName}`
  }
  template += '\n\npnpm install\n\npnpm dev'
  const message = boxen(
    template,
    {
      padding: 1,
      margin: 1,
      borderColor: 'yellow',
      borderStyle: 'round'
    }
  )
  log(message)
}

main().catch(console.error)
