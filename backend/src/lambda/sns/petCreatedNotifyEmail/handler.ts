import { middyfy } from '@libs/lambda'
import { SNSEvent, SNSHandler } from 'aws-lambda'
import { createLogger } from '@libs/logger'
let XAWS
if (process.env._X_AMZN_TRACE_ID) {
  XAWS = require("aws-xray-sdk").captureAWS(require("aws-sdk"))
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup")
  XAWS = require("aws-sdk")
}

const logger = createLogger('SNSHandler')
const handler: SNSHandler = async (event: SNSEvent) => {
    for (const snsRecord of event.Records) {
      const s3EventStr = snsRecord.Sns.Message
      const s3Event = JSON.parse(s3EventStr)
      await processEvent(s3Event) // A function that should resize each image
    }
}

async function  processEvent(record: any) {
  logger.info(record)
  const ses = createSESClient()
  await ses.sendEmail(
    {
      Message: {
        Body: {
          Text: {
            Data: record.name
          }
        },
        Subject: {
          Data: "Tarefa para realizar com o PET criada."
        }
      },
      Destination: {
        ToAddresses: [record.email]
      },
      Source: "cardososp@gmail.com"
    },(err, data) => {
      if(err){ 
        logger.error(err)
      } else {
        logger.info({message: 'Email Enviado', result: data})
      }
  })
}


function createSESClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a mocked SES')
    return {
      sendEmail: (value) => {logger.info(value)}
    }
  }

  return new XAWS.SES()
}

export const main = middyfy(handler);
