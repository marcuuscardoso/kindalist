import { DomainError } from './domain.error'

export class NotFoundException extends DomainError {
  constructor(resource: string) {
    super(`${resource} not found`)
  }
}
