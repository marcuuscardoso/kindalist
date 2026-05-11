import { AuthController } from '@/adapters/input/http/controllers/auth.controller'
import { ListController } from '@/adapters/input/http/controllers/list.controller'
import { TaskController } from '@/adapters/input/http/controllers/task.controller'
import { ListPrismaRepository } from '@/adapters/output/prisma/repositories/list.prisma.repository'
import { SessionPrismaRepository } from '@/adapters/output/prisma/repositories/session.prisma.repository'
import { TaskPrismaRepository } from '@/adapters/output/prisma/repositories/task.prisma.repository'
import { UserPrismaRepository } from '@/adapters/output/prisma/repositories/user.prisma.repository'
import { LoginUseCase } from '@/core/application/usecases/auth/login/login.usecase'
import { LogoutUseCase } from '@/core/application/usecases/auth/logout/logout.usecase'
import { RefreshUseCase } from '@/core/application/usecases/auth/refresh/refresh.usecase'
import { RegisterUseCase } from '@/core/application/usecases/auth/register/register.usecase'
import { ArchiveListUseCase } from '@/core/application/usecases/list/archive-list/archive-list.usecase'
import { CreateListUseCase } from '@/core/application/usecases/list/create-list/create-list.usecase'
import { DeleteListUseCase } from '@/core/application/usecases/list/delete-list/delete-list.usecase'
import { GetListsUseCase } from '@/core/application/usecases/list/get-lists/get-lists.usecase'
import { UpdateListUseCase } from '@/core/application/usecases/list/update-list/update-list.usecase'
import { BulkCreateTaskUseCase } from '@/core/application/usecases/task/bulk-create-task/bulk-create-task.usecase'
import { CreateTaskUseCase } from '@/core/application/usecases/task/create-task/create-task.usecase'
import { DeleteTaskUseCase } from '@/core/application/usecases/task/delete-task/delete-task.usecase'
import { GetTasksUseCase } from '@/core/application/usecases/task/get-tasks/get-tasks.usecase'
import { UpdateTaskUseCase } from '@/core/application/usecases/task/update-task/update-task.usecase'
import { BcryptPasswordHasher } from '@/infrastructure/services/bcrypt-password-hasher'
import { JwtTokenService } from '@/infrastructure/services/jwt-token-service'
import { prisma } from '../database/prisma.client'

const passwordHasher = new BcryptPasswordHasher()
const tokenService = new JwtTokenService()

const userRepository = new UserPrismaRepository(prisma)
const sessionRepository = new SessionPrismaRepository(prisma)
const listRepository = new ListPrismaRepository(prisma)
const taskRepository = new TaskPrismaRepository(prisma)

const registerUseCase = new RegisterUseCase(
  userRepository,
  sessionRepository,
  passwordHasher,
  tokenService,
)
const loginUseCase = new LoginUseCase(userRepository, sessionRepository, passwordHasher, tokenService)
const logoutUseCase = new LogoutUseCase(sessionRepository)
const refreshUseCase = new RefreshUseCase(sessionRepository, tokenService)

const createListUseCase = new CreateListUseCase(listRepository)
const getListsUseCase = new GetListsUseCase(listRepository)
const updateListUseCase = new UpdateListUseCase(listRepository)
const archiveListUseCase = new ArchiveListUseCase(listRepository)
const deleteListUseCase = new DeleteListUseCase(listRepository)

const createTaskUseCase = new CreateTaskUseCase(taskRepository, listRepository)
const bulkCreateTaskUseCase = new BulkCreateTaskUseCase(taskRepository, listRepository)
const getTasksUseCase = new GetTasksUseCase(taskRepository, listRepository)
const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, listRepository)
const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository, listRepository)

export const authController = new AuthController(
  registerUseCase,
  loginUseCase,
  logoutUseCase,
  refreshUseCase,
)

export const listController = new ListController(
  createListUseCase,
  getListsUseCase,
  updateListUseCase,
  archiveListUseCase,
  deleteListUseCase,
)

export const taskController = new TaskController(
  createTaskUseCase,
  bulkCreateTaskUseCase,
  getTasksUseCase,
  updateTaskUseCase,
  deleteTaskUseCase,
)
