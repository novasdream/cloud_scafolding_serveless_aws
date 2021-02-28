import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { middyfy } from '@libs/lambda'
import { PetAccess } from 'src/dataLayer/PetAccess';
import { formatJSONResponse } from '@libs/apiGateway';
import { getUserId } from '@libs/utils';

const petAccess = new PetAccess();
const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const petId = event.pathParameters.petId
  const userId = getUserId(event)
  
  await petAccess.delete(petId, userId);
  return formatJSONResponse({petId});
}

export const main = middyfy(handler);
