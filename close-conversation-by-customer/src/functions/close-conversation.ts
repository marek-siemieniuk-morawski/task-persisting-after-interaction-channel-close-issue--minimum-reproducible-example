// Imports global types
import '@twilio-labs/serverless-runtime-types';
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessEventObject,
  ServerlessFunctionSignature,
  TwilioClient
} from '@twilio-labs/serverless-runtime-types/types';

type MyEvent = ServerlessEventObject & {
  ConversationSid?: string
}

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  GREETING?: string
}

const getInteraction = async (
  client: TwilioClient, 
  { conversationSid }: { conversationSid: string }
): Promise<{ interactionSid: string; interactionChannelSid: string; }> => {
  const conversation = await client.conversations.v1.conversations(conversationSid).fetch();

  if (!conversation) {
    throw new Error(`Conversation ${conversationSid} not found`);
  }

  const { interactionSid, interactionChannelSid } = JSON.parse(conversation.attributes || '{}');
  console.log(`InteractionSid: ${interactionSid}, ChannelSid: ${interactionChannelSid}`);

  if (!interactionSid || !interactionChannelSid) {
    throw new Error(`InteractionSid or InteractionChannelSid not found in Conversation ${conversationSid}.`);
  }

  return { interactionSid, interactionChannelSid };
};

const closeInteractionChannel = async (
  client: TwilioClient,
  { interactionSid, interactionChannelSid }: { interactionSid: string, interactionChannelSid: string }
): Promise<void> => {
  await client.flexApi.v1
    .interaction(interactionSid)
    .channels(interactionChannelSid)
    .update({ status: "closed" });
};

export const handler: ServerlessFunctionSignature = async function (
  context: Context<MyContext>,
  event: MyEvent,
  callback: ServerlessCallback
) {
  const client = context.getTwilioClient();
  let response = new Twilio.Response();
  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
  });

  try {
    console.log(`Closing Conversation ${event.ConversationSid}...`);

    if (!event.ConversationSid) {
      throw new Error('Missing ConversationSid');
    }

    console.log(`Fetching Interaction and Channel for Conversation ${event.ConversationSid}...`);
    const { interactionSid, interactionChannelSid } = await getInteraction(client, { conversationSid: event.ConversationSid });
    
    console.log(`Closing Interaction ${interactionSid} and InteractionChannel ${interactionChannelSid}...`);
    await closeInteractionChannel(client, { interactionSid, interactionChannelSid });

    console.log(`Conversation ${event.ConversationSid} closed!`);

    response.setStatusCode(200);
    response.setBody(`Interaction ${interactionSid} and Channel ${interactionChannelSid} closed`);
    return callback(null, response);
  } catch (error) {
    console.error(error);
    response.setStatusCode(500);
    response.setBody((error as Error).message);
    callback(null, response);
  }
};