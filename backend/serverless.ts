import type { AWS } from '@serverless/typescript';

import { createPet, deletePet, getPets, updatePet, generateUploadUrl } from './src/lambda/http';
import { PetCreatedNotifyEmail } from './src/lambda/sns'
import { Auth } from './src/lambda/auth'
import { RememberPet } from './src/lambda/schedule';

const serverlessConfiguration: AWS = {
  service: 'pet-udacity',
  frameworkVersion: '2',
  custom: {
    'serverless-offline': {
      port: 3003,
    },
    dynamodb: {
      start: {
        port: "8000",
        inMemory: true,
        migrate: true
      },
      stages: ['local']
    },
    sns : {
      pet : {
        created: 'UDACITY-PET-CREATED-${self:provider.stage}'
      },
    },
    topicPetCreated: {
      'Fn::Join': [':', ['arn:aws:iam:', { Ref: 'AWS::AccountId' }, '${self:custom.sns.pet.created}']]
    },
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
  },
  plugins: [
    'serverless-webpack',
    'serverless-iam-roles-per-function',
    'serverless-dynamodb-local',
    'serverless-reqvalidator-plugin',
    'serverless-offline'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'us-west-2',
    stage: 'dev',
    tracing: {
      apiGateway: true,
      lambda: true
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      PETS_TABLE: 'PETS-4-${self:provider.stage}',
      PET_ATTACHMENT: 'pets-attachment-udacity-${self:provider.stage}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SIGNED_URL_EXPIRATION: '300',
      AUTH_0_SECRET_ID: 'Auth0Secret-Pets-${self:provider.stage}',
      AUTH_0_SECRET_FIELD: 'auth0Secret-Pets'
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [ 'secretsmanager:GetSecretValue' ],
        Resource: { Ref : 'Auth0SecretPets' }
      },
      {
        Effect: 'Allow',
        Action: [ 'kms:Decrypt' ],
        Resource: { 'Fn::GetAtt': ['KMSKey', 'Arn'] }
      }
    ],
    lambdaHashingVersion: '20201221',
  },
  functions: {
    Auth, createPet, deletePet, getPets, updatePet, generateUploadUrl,
    PetCreatedNotifyEmail, RememberPet
  },
  resources: {
    Resources: {
      PetsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          AttributeDefinitions: [
            { AttributeName: 'petId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
          ],
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }, 
            { AttributeName: 'petId', KeyType: 'RANGE' }, 
          ],
          GlobalSecondaryIndexes: [{
            IndexName: 'byUserId', 
            KeySchema: [
              {
                AttributeName: 'userId',
                KeyType: 'HASH'
              },
              {
                AttributeName: 'createdAt',
                KeyType: 'RANGE'
              },
            ], 
            Projection: {ProjectionType: 'ALL'}
          }],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: '${self:provider.environment.PETS_TABLE}'
        }, 
      },
      AttachmentsBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:provider.environment.PET_ATTACHMENT}",
          CorsConfiguration: {
            CorsRules: [{
              AllowedOrigins: ['*'],
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              MaxAge: 3000
            }]
          },
        },
      },
      BucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          PolicyDocument: {
            Id: "MyPolicy",
            Version: "2012-10-17",
            Statement: [
              {
                Sid: 'PublicReadForGetBucketObjects',
                Effect: 'Allow',
                Principal: '*',
                Action: 's3:GetObject',
                Resource: 'arn:aws:s3:::${self:provider.environment.PET_ATTACHMENT}/*'
              }
            ],
          },
          Bucket: { Ref: 'AttachmentsBucket' }
        }
      },

      KMSKey: {
        Type: 'AWS::KMS::Key',
        Properties: {
          Description: 'KMS key to encrypt Auth0 secret',
          KeyPolicy: {
            Version: "2012-10-17",
            Id: 'key-default-1',
            Statement: [{
              Sid: 'Allow Administration of key',
              Effect: "Allow",
              Principal: {
                AWS: {
                  'Fn::Join': [':', ['arn:aws:iam:', { Ref: 'AWS::AccountId' }, 'root']]
                }
              },
              Action: ['kms:*'],
              Resource: '*'
            }]
          }
        }
      },
      KMSKeyAlias: {
        Type: 'AWS::KMS::Alias',
        Properties: {
          AliasName: 'alias/auth0Key-Pets-${self:provider.stage}',
          TargetKeyId: { Ref: 'KMSKey' }
        }
      },
      Auth0SecretPets: {
        Type: 'AWS::SecretsManager::Secret',
        Properties: {
          Name: '${self:provider.environment.AUTH_0_SECRET_ID}',
          Description: 'AUTH0 Secret',
          KmsKeyId: { Ref: 'KMSKey' }
        }
      },
      TodoCreatedTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          DisplayName: 'A new Pet Task has created',
          TopicName: '${self:custom.sns.pet.created}'
        }
      },
    },
  }
}

module.exports = serverlessConfiguration;
