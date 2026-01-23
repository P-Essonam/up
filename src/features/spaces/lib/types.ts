export type SpaceList = {
  id: string
  name: string
  count?: number
}

export type Space = {
  id: string
  name: string
  description?: string
  color: string
  lists: SpaceList[]
  isOpen?: boolean
  icon?: string
}
