import { ArchiveListInput } from '@/core/application/usecases/list/archive-list/archive-list.input'
import { ArchiveListOutput } from '@/core/application/usecases/list/archive-list/archive-list.output'
import { CreateListInput } from '@/core/application/usecases/list/create-list/create-list.input'
import { CreateListOutput } from '@/core/application/usecases/list/create-list/create-list.output'
import { DeleteListInput } from '@/core/application/usecases/list/delete-list/delete-list.input'
import { DeleteListOutput } from '@/core/application/usecases/list/delete-list/delete-list.output'
import { GetListsInput } from '@/core/application/usecases/list/get-lists/get-lists.input'
import { GetListsOutput } from '@/core/application/usecases/list/get-lists/get-lists.output'
import { UpdateListInput } from '@/core/application/usecases/list/update-list/update-list.input'
import { UpdateListOutput } from '@/core/application/usecases/list/update-list/update-list.output'

export interface CreateListUseCasePort {
  execute(input: CreateListInput): Promise<CreateListOutput>
}

export interface GetListsUseCasePort {
  execute(input: GetListsInput): Promise<GetListsOutput>
}

export interface UpdateListUseCasePort {
  execute(input: UpdateListInput): Promise<UpdateListOutput>
}

export interface ArchiveListUseCasePort {
  execute(input: ArchiveListInput): Promise<ArchiveListOutput>
}

export interface DeleteListUseCasePort {
  execute(input: DeleteListInput): Promise<DeleteListOutput>
}
