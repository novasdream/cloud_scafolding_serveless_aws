import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { middyfy } from '@libs/lambda';
import { PetAccess } from 'src/dataLayer/PetAccess';
import { formatJSONResponse } from '@libs/apiGateway';
import { eventNames } from 'process';
import {getUserId} from '../../../libs/utils'
const petAccess = new PetAccess();

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  
  const items = await petAccess.getAllPetItems(userId);
  
  return formatJSONResponse({items})
}

export const main = middyfy(handler);