import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copySync, existsSync, mkdirSync, readJsonSync, writeJsonSync } from 'fs-extra'
import { intro, text, select, outro } from '@clack/prompts'
import color from 'picocolors'
import validatePkg from 'validate-npm-package-name'
import parseArgs from 'minimist'
import boxen from 'boxen'

const log = console.log

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

  // Rename project package.json name
  const projectPkgPath = resolve(rootPath, 'package.json')
  const pkg = readJsonSync(projectPkgPath)
  pkg.name = projectName
  writeJsonSync(projectPkgPath, pkg, { spaces: 2 })

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
