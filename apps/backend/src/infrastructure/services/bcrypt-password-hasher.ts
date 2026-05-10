import bcrypt from 'bcrypt'
import { PasswordHasherPort } from '@/core/application/ports/output/password-hasher.port'

export class BcryptPasswordHasher implements PasswordHasherPort {
  private readonly saltRounds = 12

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
