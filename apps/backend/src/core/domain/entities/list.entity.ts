export type ListProps = {
  id: string
  title: string
  description: string | null
  isArchived: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export class List {
  readonly id: string
  readonly title: string
  readonly description: string | null
  readonly isArchived: boolean
  readonly userId: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: ListProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.isArchived = props.isArchived
    this.userId = props.userId
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
