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

interface MetadataObject {
  count: number
  results: ResultObject[]
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

  return (await response.json()) as MetadataObject
}
