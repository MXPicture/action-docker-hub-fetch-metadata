import * as core from '@actions/core'
import {get_tags} from './metadata'

async function run(): Promise<void> {
  try {
    const repository: string = core.getInput('repository')
    let max_items: string = core.getInput('max_items')

    if (!max_items) {
      max_items = '999'
    }

    const metadata = await get_tags(repository, max_items)
    core.setOutput('count', metadata.count)
    core.setOutput('results', metadata.results)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else if (typeof error === 'string') {
      core.setFailed(error)
    } else {
      core.setFailed('unknown')
    }
  }
}

run()
