import { DomainError } from './domain.error'

export class UnauthorizedException extends DomainError {
  constructor() {
    super('Unauthorized')
  }
}
