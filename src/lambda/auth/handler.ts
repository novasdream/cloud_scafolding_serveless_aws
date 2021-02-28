import { APIGatewayRequestAuthorizerEvent, CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '@libs/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

import * as uuid from 'uuid'
import { middyfy } from '@libs/lambda'
import secretsManager  from '@middy/secrets-manager'
const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = '...'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const handler = async (
  event: CustomAuthorizerEvent,
  context
): Promise<CustomAuthorizerResult> => {
  if (process.env.IS_OFFLINE) {
    return {
      principalId: 'user', //jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  }
  // logger.info('Authorizing a user', event.headers['Authorization'])
  console.log('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(
      event.authorizationToken,
      context.AUTH0_SECRET[secretField]
      )
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub, //jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    // logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string, cert: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJGBSkjvrV648XMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1meGhmYmFvaS51cy5hdXRoMC5jb20wHhcNMjEwMjE4MDM1MjM0WhcN
MzQxMDI4MDM1MjM0WjAkMSIwIAYDVQQDExlkZXYtZnhoZmJhb2kudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0GEyVSzAvbserSTY
gCE8ZRJT9TfgEFvm/kwipetKDoe7sLEy6KfVdyaptD2SbDtosSAxHO3V4ZP2jiBU
nfBOr7C/htY4UPh1d3t5UiLb0ITiTCMbQW30WTAl5Kd727h5OfvR5Rf+Lm84oGqa
gD8IXncSH1pGbOUULTxlQ+G2UnbnbGzmVVkVQT7E0yvSxuXoX/lyN6/I5ZRYpnCL
S2Bye9uZgORC62kE1wXqQAP7leBLE8LMlxhQLVfMmh1pO/TRVM6VzhCFViUFghcd
LXFAwUnNNxbMih4BbOPa6KpYfF/eTC8FVmHI79E4T3JrZE0YD/ZR093YFQIv1ljv
2wOLMQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRDsP302ndD
+dwsxHiZUCn3bsQcDjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AB0JSVi/dNfO0cMn/aBwSgNDcY8qY7IGY1VMAuWfcAbNklG3PUu1h/wnW31UBScv
Waw5hKkCaePv4LbY6x/bPBig1GZV32B58/tsLUXBa/XsKvbFQLRoqSWsTE7XcSXz
JEbxzeWuB/4YY5c21AePecLuzCFrH29AfdoaNYC0m70giTc2pDCSENOL704sBWgl
K83/zeBDzOn1g1JOnVnAz4tbJjeuYiPOTKoU1zsJzRbia8qEFCAuCNw6zOAtLTcr
UbW0Qe1n+yIhrFMsE26LWH4HBcU2OsNmY5TO6e8UnwKqUJjskC4hPyB3VVqwLrSI
VGklcOs6B3cxWrsKersOG1U=
-----END CERTIFICATE-----`

  const verified = verify(token, cert, { algorithms: ['RS256']})
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verified
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

export const main = middyfy(handler);
main.use(secretsManager({
  cache: true,
  cacheExpiryInMillis: 60000,
  throwOnFailedCall: true,
  secrets: {
    AUTH0_SECRET: secretId
  }
}))