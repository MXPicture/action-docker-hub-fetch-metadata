import * as core from '@actions/core'
import {get_tags} from './metadata'

async function run(): Promise<void> {
  try {
    const repository: string = core.getInput('repository')
    const metadata = await get_tags(repository)
    core.setOutput('count', metadata.count)
    core.setOutput('results', metadata.results)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
