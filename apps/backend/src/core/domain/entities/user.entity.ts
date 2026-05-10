import { Role } from '../enums/user-role.enum'

export type UserProps = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export class User {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly password: string
  readonly role: Role
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: UserProps) {
    this.id = props.id
    this.name = props.name
    this.email = props.email
    this.password = props.password
    this.role = props.role
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
