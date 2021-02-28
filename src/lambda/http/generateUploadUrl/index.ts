export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  environment: {
    STAGE: '${self:provider.stage}',
  },
  events: [
    {
      http: {
        method: 'post',
        path: 'pets/{petId}/attachment',
        cors: true,
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:UpdateItem'],
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PETS_TABLE}'
    },
    {
      Effect: 'Allow',
      Action: ['s3:PutObject', 's3:GetOject'],
      Resource: 'arn:aws:s3:::${self:provider.environment.PET_ATTACHMENT}/*'
    },
  ]
}
