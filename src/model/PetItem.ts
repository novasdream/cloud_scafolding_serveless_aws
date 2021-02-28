export interface PetItem {
  userId: string
  petId: string
  createdAt: string
  name: string
  email: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
