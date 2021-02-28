import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserEmail, parseUserId } from "../auth/utils";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  if (process.env.IS_OFFLINE) {
    return "0001"
  }
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}
export function getUserEmail(event: APIGatewayProxyEvent): string {
  if (process.env.IS_OFFLINE) {
    return "cardososp@gmail.com"
  }
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserEmail(jwtToken)
}