import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreatePetRequest } from '../../../requests/CreatePetRequest'
import { middyfy } from '@libs/lambda'
import { PetAccess } from 'src/dataLayer/PetAccess';
import { formatJSONResponse } from '@libs/apiGateway';

import * as uuid from 'uuid'
import { PetItem } from 'src/model/PetItem';
import {getUserEmail, getUserId} from '../../../libs/utils'
import * as AWS from 'aws-sdk'
import { createLogger } from '@libs/logger'
const logger = createLogger('createPet')
const petAccess = new PetAccess();

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, context): Promise<APIGatewayProxyResult> => {
  const createRequest: CreatePetRequest = event.body as any as CreatePetRequest;
  const userId = getUserId(event)
  const email = getUserEmail(event)
  const newPet : PetItem = {
    petId        : uuid.v4(),
    userId        : userId,
    done          : false,
    name          : createRequest.name,
    email         : email,
    createdAt     : new Date().toISOString(),
    dueDate       : new Date().toISOString(),
  };

  const item = await petAccess.createPet(newPet);

  const functionArnCols = context.invokedFunctionArn.split(':')
  const region = functionArnCols[3]
  const accountId = functionArnCols[4]
  
  const params = {
    Message: JSON.stringify(item),
    TopicArn: `arn:aws:sns:${region}:${accountId}:UDACITY-PET-CREATED-dev`
  }
  
  if (!process.env.IS_OFFLINE) {
    const sns = new AWS.SNS()
    sns.publish(params, (error, data) => {
      if (error) {
        logger.error('Fail on publish to topic', error)
      } else {
        logger.info("success on publish on topic")
      }
    })
  }

  return formatJSONResponse({item});
}

export const main = middyfy(handler);

