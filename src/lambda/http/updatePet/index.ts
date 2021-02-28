import schema from './schema';

export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  environment: {
    STAGE: '${self:provider.stage}',
    // API_ID: {
    //   Ref: 'WebsocketsApi'
    // }
  },
  events: [
    {
      http: {
        authorizer: 'Auth',
        method: 'patch',
        path: 'pets/{petId}',
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
      Action: ['dynamodb:UpdateItem'],
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PETS_TABLE}'
    },
  ]
}
