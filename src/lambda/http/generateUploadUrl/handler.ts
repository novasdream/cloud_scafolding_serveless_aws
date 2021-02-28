import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { middyfy } from '@libs/lambda'
import { PetAccess } from 'src/dataLayer/PetAccess'

let XAWS
if (process.env._X_AMZN_TRACE_ID) {
  XAWS = require("aws-xray-sdk").captureAWS(require("aws-sdk"))
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup")
  XAWS = require("aws-sdk")
}

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName  = process.env.PET_ATTACHMENT
const urlExpiration = Number.parseInt(process.env.SIGNED_URL_EXPIRATION)
import * as uuid from 'uuid'
import { formatJSONResponse } from '@libs/apiGateway'
import { getUserId } from '@libs/utils'

import { createLogger } from '@libs/logger'

const logger = createLogger('GenerateUploadURL')
const petAccess = new PetAccess();
const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const petId = event.pathParameters.petId
  const userId = getUserId(event)
  
  const imageId = uuid.v4()

  await petAccess.attachmentPet(petId, userId, `https://${bucketName}.s3.amazonaws.com/${imageId}`)

  const uploadUrl = await getUploadUrl(imageId);
  logger.info({userId, message:`Generated uploadURL`, petId})
  return formatJSONResponse({uploadUrl});
}

async function getUploadUrl(imageId: string) {
  return s3.getSignedUrlPromise('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}

export const main = middyfy(handler);