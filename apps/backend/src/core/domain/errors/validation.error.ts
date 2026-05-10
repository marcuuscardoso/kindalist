import { DomainError } from './domain.error'

export class ValidationException extends DomainError {
  constructor(message: string) {
    super(message)
  }
}
