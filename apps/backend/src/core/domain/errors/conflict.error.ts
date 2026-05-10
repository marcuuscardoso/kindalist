import { DomainError } from './domain.error'

export class ConflictException extends DomainError {
  constructor(resource: string) {
    super(`${resource} already exists`)
  }
}
