import 'source-map-support/register'

import { APIGatewayProxyEvent, EventBridgeEvent, EventBridgeHandler } from 'aws-lambda'
import { middyfy } from '@libs/lambda';
import { PetAccess } from 'src/dataLayer/PetAccess';
import { formatJSONResponse } from '@libs/apiGateway';
import {getUserId} from '../../../libs/utils'
const petAccess = new PetAccess();

const handler: EventBridgeHandler = async (event: APIGatewayProxyEvent, context: any, callback: any) => {
  console.log(event)
}

export const main = middyfy(handler);