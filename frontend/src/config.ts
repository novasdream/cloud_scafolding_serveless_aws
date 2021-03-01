// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'a61jmrxms3'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-fxhfbaoi.us.auth0.com',            // Auth0 domain
  clientId: '4pBuyHEIPdeqmlkeSSRxwR8nJAEsxTG5',          // Auth0 client id
  callbackUrl: 'https://pets-udacity-novasdream.s3-us-west-2.amazonaws.com/callback'
}
