
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { PetItem } from 'src/model/PetItem'
import { CreatePetRequest } from 'src/requests/CreatePetRequest'
import { UpdatePetRequest } from 'src/requests/UpdatePetRequest'
import { createLogger } from '@libs/logger'

const logger = createLogger('PetAccess')
let XAWS
if (process.env._X_AMZN_TRACE_ID) {
  XAWS = require("aws-xray-sdk").captureAWS(require("aws-sdk"))
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup")
  XAWS = require("aws-sdk")
}

export class PetAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly petsTable = process.env.PETS_TABLE
  ) {}

  async getAllUndonePets(): Promise<PetItem[]> {
    logger.info({ message:'Listing all undone Pets'})

    const result = await this.docClient.query({
      TableName: this.petsTable,
      KeyConditionExpression: 'done = :done',
      ExpressionAttributeValues: {
        ':done': false
      }
    }).promise();

    const items = result.Items
    return items as PetItem[]
  }

  async getAllPetItems(userId: string): Promise<PetItem[]> {
    logger.info({userId, message:'Listing all Pet Items'})

    const result = await this.docClient.query({
      TableName: this.petsTable,
      IndexName: 'byUserId',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();

    const items = result.Items
    return items as PetItem[]
  }

  async createPet(data: PetItem): Promise<CreatePetRequest> {
    logger.info({userId: data.userId, message:`Creating Pet`, petId: data.petId})
    await this.docClient.put({
      TableName: this.petsTable,
      Item: data
    }).promise()

    return data
  }

  async attachmentPet(petId: string, userId: string, attachmentUrl: string) {
    logger.info({userId, message:`Attaching Pet`, petId})
    await this.docClient.update({
      TableName: this.petsTable,
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl'     : attachmentUrl
      },
      Key: { petId, userId },
      ReturnValues: 'UPDATED_NEW'
    }).promise()
  }

  async updatePet(petId: string, userId: string, data: UpdatePetRequest) {
    logger.info({userId, message:`Updating Pet`, petId})
    await this.docClient.update({
      TableName: this.petsTable,
      UpdateExpression: 'set dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':dueDate'  : data.dueDate,
        ':done'     : data.done
      },
      Key: { petId, userId },
      ReturnValues: 'UPDATED_NEW'
    }).promise()
  }

  async delete(petId: string, userId: string) {
    logger.info({userId, message:`Deleting Pet`, petId})
    await this.docClient.delete({
      TableName: this.petsTable,
      Key: {
        petId, userId
      }
    }).promise()
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}