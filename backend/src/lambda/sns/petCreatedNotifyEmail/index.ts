export default {
  handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
  environment: {
    STAGE: '${self:provider.stage}'
  },
  events: [
    {
      sns: {
        arn: {
          'Fn::Join': [':', ['arn:aws:sns', {Ref: 'AWS::Region'}, {Ref: 'AWS::AccountId'}, '${self:custom.sns.pet.created}']]
        },
        topicName: '${self:custom.sns.pet.created}'
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['ses:SendEmail'],
      //arn:aws:ses:us-west-2:588731248883:identity/cardososp@gmail.com
      Resource: 'arn:aws:ses:${self:provider.region}:*:identity/*'
    }
  ]
}
