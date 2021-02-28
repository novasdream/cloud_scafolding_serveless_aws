export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  environment: {
    STAGE: '${self:provider.stage}',
  },
  events: [
    {
      http: {
        method: 'delete',
        path: 'pets/{petId}',
        cors: true,
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:DeleteItem'],
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PETS_TABLE}'
    },
  ]
}
