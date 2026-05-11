import { ArchiveListInput } from '@/core/application/usecases/list/archive-list/archive-list.input'
import { CreateListInput } from '@/core/application/usecases/list/create-list/create-list.input'
import { DeleteListInput } from '@/core/application/usecases/list/delete-list/delete-list.input'
import { GetListsInput } from '@/core/application/usecases/list/get-lists/get-lists.input'
import { UpdateListInput } from '@/core/application/usecases/list/update-list/update-list.input'
import { ArchiveListSchema, CreateListSchema, UpdateListSchema } from '../schemas/list.schema'

export const listMapper = {
  toCreateInput(body: CreateListSchema, userId: string): CreateListInput {
    return {
      userId,
      title: body.title,
      ...(body.description !== undefined && { description: body.description }),
    }
  },

  toUpdateInput(body: UpdateListSchema, userId: string, listId: string): UpdateListInput {
    return {
      id: listId,
      userId,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
    }
  },

  toArchiveInput(body: ArchiveListSchema, userId: string, listId: string): ArchiveListInput {
    return {
      id: listId,
      userId,
      isArchived: body.isArchived as boolean,
    }
  },

  toGetListsInput(userId: string, archived: boolean): GetListsInput {
    return {
      userId,
      archived,
    }
  },

  toDeleteInput(userId: string, listId: string): DeleteListInput {
    return {
      id: listId,
      userId,
    }
  },
}
