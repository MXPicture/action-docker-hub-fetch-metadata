import {default as fetch} from 'node-fetch'

interface ResultObject {
  creator: number
  id: number
  last_updated: string
  last_updater: number
  last_updater_username: string
  name: string
  repository: number
  full_size: number
  v2: boolean
  tag_status: string
  tag_last_pulled: string
  tag_last_pushed: string
}

interface VersionObject {
  major: number
  major_name: string
  minor: number
  minor_name: string
  bug: number
  bug_name: string
}

interface MetadataObject {
  count: number
  results: ResultObject[]
  current_version: VersionObject
}

export async function get_tags(
  repository: string,
  max_items: string
): Promise<MetadataObject> {
  const response = await fetch(
    `https://hub.docker.com/v2/repositories/${repository}/tags?page_size=${max_items}`
  )

  if (!response.ok) {
    throw new Error(
      `No matching repository found. ${response.status}: ${response.statusText}`
    )
  }

  const result = (await response.json()) as MetadataObject

  const buildVersion = (
    major: number,
    minor: number | undefined = undefined,
    bug: number | undefined = undefined
  ): string => {
    if (bug !== undefined) {
      return `v${major}.${minor}.${bug}`
    }
    if (minor !== undefined) {
      return `v${major}.${minor}`
    }
    return `v${major}`
  }

  const setResultLastVersion = (
    major: number,
    minor: number,
    bug: number
  ): void => {
    if (!result.current_version) {
      result.current_version = {
        major,
        major_name: buildVersion(major),
        minor,
        minor_name: buildVersion(major, minor),
        bug,
        bug_name: buildVersion(major, minor, bug)
      }
    } else {
      result.current_version.major = major
      result.current_version.major_name = buildVersion(major)
      result.current_version.minor = minor
      result.current_version.minor_name = buildVersion(major, minor)
      result.current_version.bug = bug
      result.current_version.bug_name = buildVersion(major, minor, bug)
    }
  }

  const checkResultLastVersion = (
    major: number,
    minor: number,
    bug: number
  ): boolean => {
    if (major < result.current_version.major) return false
    if (major > result.current_version.major) {
      setResultLastVersion(major, minor, bug)
      return true
    }

    // major is equal
    if (minor < result.current_version.minor) return false
    if (minor > result.current_version.minor) {
      setResultLastVersion(major, minor, bug)
      return true
    }

    // minor is equal
    if (bug < result.current_version.bug) return false
    if (bug > result.current_version.bug) {
      setResultLastVersion(major, minor, bug)
      return true
    }

    return false
  }

  setResultLastVersion(1, 0, 0)

  for (const item of result.results) {
    const matches = item.name.match('^v([0-9]+).([0-9]+).([0-9]+)$')
    if (!matches) continue
    const major = parseInt(matches[1])
    const minor = parseInt(matches[2])
    const bug = parseInt(matches[3])
    checkResultLastVersion(major, minor, bug)
  }

  return {
    count: result.count,
    results: result.results,
    current_version: result.current_version
  }
}
