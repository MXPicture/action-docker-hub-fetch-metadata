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

// eslint-disable-next-line no-shadow
enum NextVersionType {
  bug = 'bug',
  minor = 'minor',
  major = 'major'
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
  next_version: VersionObject
}

export async function get_tags(
  repository: string,
  max_items: string,
  next_version_type: NextVersionType = NextVersionType.bug
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

  const set_current_version = (
    major: number,
    minor: number,
    bug: number
  ): void => {
    // set current
    if (!result.current_version) {
      result.current_version = {
        major,
        major_name: '',
        minor,
        minor_name: '',
        bug,
        bug_name: ''
      }
    } else {
      result.current_version.major = major
      result.current_version.minor = minor
      result.current_version.bug = bug
    }
  }

  const set_next_version = (next_type: NextVersionType): void => {
    // set next
    result.next_version = {
      major: result.current_version.major,
      major_name: '',
      minor: result.current_version.minor,
      minor_name: '',
      bug: result.current_version.bug,
      bug_name: ''
    }

    switch (next_type) {
      case NextVersionType.bug:
        result.next_version.bug++
        break

      case NextVersionType.minor:
        result.next_version.bug = 0
        result.next_version.minor++
        break

      case NextVersionType.major:
        result.next_version.bug = 0
        result.next_version.minor = 0
        result.next_version.major++
        break

      default:
        break
    }
  }

  const set_version_names = (): void => {
    // current version
    result.current_version.bug_name = buildVersion(
      result.current_version.major,
      result.current_version.minor,
      result.current_version.bug
    )

    result.current_version.minor_name = buildVersion(
      result.current_version.major,
      result.current_version.minor
    )

    result.current_version.major_name = buildVersion(
      result.current_version.major
    )

    // next version
    result.next_version.bug_name = buildVersion(
      result.next_version.major,
      result.next_version.minor,
      result.next_version.bug
    )

    result.next_version.minor_name = buildVersion(
      result.next_version.major,
      result.next_version.minor
    )

    result.next_version.major_name = buildVersion(result.next_version.major)
  }

  const check_result_last_version = (
    major: number,
    minor: number,
    bug: number
  ): boolean => {
    if (major < result.current_version.major) return false
    if (major > result.current_version.major) {
      set_current_version(major, minor, bug)
      return true
    }

    // major is equal
    if (minor < result.current_version.minor) return false
    if (minor > result.current_version.minor) {
      set_current_version(major, minor, bug)
      return true
    }

    // minor is equal
    if (bug < result.current_version.bug) return false
    if (bug > result.current_version.bug) {
      set_current_version(major, minor, bug)
      return true
    }

    return false
  }

  set_current_version(1, 0, 0)

  for (const item of result.results) {
    const matches = item.name.match('^v([0-9]+).([0-9]+).([0-9]+)$')
    if (!matches) continue
    const major = parseInt(matches[1])
    const minor = parseInt(matches[2])
    const bug = parseInt(matches[3])
    check_result_last_version(major, minor, bug)
  }

  set_next_version(next_version_type)
  set_version_names()

  return {
    count: result.count,
    results: result.results,
    current_version: result.current_version,
    next_version: result.next_version
  }
}
