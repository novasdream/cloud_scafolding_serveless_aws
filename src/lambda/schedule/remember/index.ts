export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  events : [
    {
      eventBridge: {
        schedule: 'rate(30 minutes)'
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:Query'],
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PETS_TABLE}'
    },
    {
      Effect: 'Allow',
      Action: ['dynamodb:Query'],
      Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PETS_TABLE}/index/byUserId'
    },
  ]
}
