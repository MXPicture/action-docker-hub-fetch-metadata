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
    core.setOutput('version_bug', metadata.current_version.bug_name)
    core.setOutput('version_minor', metadata.current_version.minor_name)
    core.setOutput('version_major', metadata.current_version.major_name)
    core.setOutput('next_version_bug', metadata.next_version.bug_name)
    core.setOutput('next_version_minor', metadata.next_version.minor_name)
    core.setOutput('next_version_major', metadata.next_version.major_name)
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
