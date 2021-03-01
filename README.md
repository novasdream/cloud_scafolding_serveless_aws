# Cloud Scafolding Backend

[![CI](https://github.com/novasdream/cloud_scafolding_serveless_aws/actions/workflows/main.yml/badge.svg)](https://github.com/novasdream/cloud_scafolding_serveless_aws/actions/workflows/main.yml)

This project are using Serverless with AWS.

## Configuration

Backend configuration is based in details
`serverless.ts

```typescript

{....
    environment: {
        PETS_TABLE: 'PETS-4-${self:provider.stage}',
        PET_ATTACHMENT: 'pets-attachment-udacity-${self:provider.stage}',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        SIGNED_URL_EXPIRATION: '300',
        AUTH_0_SECRET_ID: 'Auth0Secret-Pets-${self:provider.stage}',
        AUTH_0_SECRET_FIELD: 'auth0Secret-Pets'
    },
}
```

Here you can define your table name for details, s3 folders, and not for security we use [AWS Secrets Manager](https://aws.amazon.com/pt/secrets-manager/)

When you create your secret you must use the name `auth0Secret`

Value of `auth0Secret` if you use auth0 you can set in 
`Application Details` -> `Show Advanced Settings` -> `Certificates` -> `Signing Certificate`

Also in `auth0` you need configure 
`Allowed Callback URLs` and `Allowed Logout URLs`

After you configure your `auth0` you need to configure our frontend to work has expected, go to `./frontend/src/config.ts` 

Set your `domain` and `clientId`. Tip: You will use same as in auth0

After deploy the lambda backend you only will need  configure `apiId` in config file.


# More details 

Follow the link to more details about [Backend] 

Follow the link to more details about [Frontend] 

[Backend]: <https://github.com/novasdream/cloud_scafolding_serveless_aws/tree/master/backend>
[Frontend]: <https://github.com/novasdream/cloud_scafolding_serveless_aws/tree/master/frontend>
