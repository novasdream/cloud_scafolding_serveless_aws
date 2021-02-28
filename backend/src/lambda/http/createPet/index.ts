import schema from './schema';

export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  environment: {
    STAGE: '${self:provider.stage}',
  },
  events: [
    {
      http: {
        method: 'post',
        path: 'pets',
        cors: true,
        request: {
          schema: {
            'application/json': schema
          } 
        }
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:PutItem'],
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PETS_TABLE}'
    },
    {
      Effect: 'Allow',
      Action: ['SNS:Publish'],
      Resource: { Ref : 'TodoCreatedTopic' }
    },
  ]
}
