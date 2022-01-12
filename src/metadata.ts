import {default as fetch, Headers} from 'node-fetch'

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

interface MetadataObject {
  count: number
  results: ResultObject[]
}

export async function get_tags(repository: string): Promise<MetadataObject> {
  let response

  // Generate header using pull token
  response = await fetch(
    `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repository}:pull`
  )
  const response_json = await response.json()

  const auth_header = new Headers({
    Authorization: `Bearer ${response_json.token}`,
    Accept: 'application/vnd.docker.distribution.manifest.v2+json'
  })
  // Get digest from manifest
  response = await fetch(
    `https://hub.docker.com/v2/repositories/${repository}/tags`,
    {headers: auth_header}
  )
  if (!response.ok) {
    throw new Error('No matching repository found.')
  }

  return await response.json()
}
