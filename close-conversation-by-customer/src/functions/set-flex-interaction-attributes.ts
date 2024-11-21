// Imports global types
import '@twilio-labs/serverless-runtime-types';
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
  ServerlessEventObject
} from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = ServerlessEventObject & {
  ConversationSid?: string
  Attributes?: string
}

export const handler: ServerlessFunctionSignature = async function (
  context: Context,
  event: MyEvent,
  callback: ServerlessCallback
) {
  const client = context.getTwilioClient();
  let response = new Twilio.Response();
  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
  });

  try {
    console.log(`Updating conversation attributes for ${event.ConversationSid}`);

    if (!event.ConversationSid) {
      throw new Error('ConversationSid is required');
    }

    if (!event.Attributes) {
      throw new Error('Attributes is required');
    }

    const { flexInteractionSid, flexInteractionChannelSid } = JSON.parse(event.Attributes);

    if (!flexInteractionSid || !flexInteractionChannelSid) {
      throw new Error('Attributes must contain flexInteractionSid and flexInteractionChannelSid');
    }

    const conversation = await client.conversations.v1.conversations(event.ConversationSid).fetch();

    if (!conversation) {
      throw new Error(`Conversation ${event.ConversationSid} not found`);
    }

    await client.conversations.v1
      .conversations(event.ConversationSid)
      .update({
        attributes: JSON.stringify({
          ...JSON.parse(conversation.attributes || '{}'),
          interactionSid: flexInteractionSid,
          interactionChannelSid: flexInteractionChannelSid
        })
      });

    response.setBody({ success: true });
    response.setStatusCode(200);
    callback(null, response);
  } catch (error) {
    console.error(error);
    response.setStatusCode(500);
    response.setBody((error as Error).message);
    callback(null, response);
  }
};