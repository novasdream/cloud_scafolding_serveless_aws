import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdatePetRequest } from '../../../requests/UpdatePetRequest'
import { middyfy } from '@libs/lambda'
import { PetAccess } from 'src/dataLayer/PetAccess';
import { formatJSONResponse } from '@libs/apiGateway';
import { getUserId } from '@libs/utils';

const petAccess = new PetAccess();
const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const petId = event.pathParameters.petId
  const userId = getUserId(event)
  const updatedPet: UpdatePetRequest = event.body  as any as UpdatePetRequest

  // TODO: Update a TODO item with the provided id using values in the "updatedPet" object
  await petAccess.updatePet(petId,userId,  updatedPet)
  
  return formatJSONResponse({petId});
}

export const main = middyfy(handler);