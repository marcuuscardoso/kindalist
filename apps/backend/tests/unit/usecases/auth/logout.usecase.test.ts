import { LogoutUseCase } from '@/core/application/usecases/auth/logout/logout.usecase'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'

const mockSessionRepository: jest.Mocked<SessionRepositoryPort> = {
  findById: jest.fn(),
  create: jest.fn(),
  updateLastUsedAt: jest.fn(),
  delete: jest.fn(),
}

describe('LogoutUseCase', () => {
  let usecase: LogoutUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new LogoutUseCase(mockSessionRepository)
  })

  it('should delete session when session exists', async () => {
    mockSessionRepository.findById.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      refreshToken: 'hashed-refresh-token',
      userAgent: null,
      ipAddress: null,
      lastUsedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date('2026-01-08T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockSessionRepository.delete.mockResolvedValue(undefined)

    const output = await usecase.execute({ sessionId: 'session-id', userId: 'user-id' })

    expect(output).toEqual({ success: true })
  })

  it('should throw NotFoundException when session does not exist', async () => {
    mockSessionRepository.findById.mockResolvedValue(null)

    await expect(usecase.execute({ sessionId: 'session-id', userId: 'user-id' })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  it('should throw UnauthorizedException when session belongs to another user', async () => {
    mockSessionRepository.findById.mockResolvedValue({
      id: 'session-id',
      userId: 'owner-id',
      refreshToken: 'hashed-refresh-token',
      userAgent: null,
      ipAddress: null,
      lastUsedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date('2026-01-08T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await expect(usecase.execute({ sessionId: 'session-id', userId: 'other-user-id' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })
})
