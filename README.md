# Task Persisting After Interaction Channel Close Issue - Minimum Reproducible Example

We've added a new feature allowing the customers to initiate chat closure whenever they want, we have an edge case where the customer might reply to a parked chat but then close the conversation after we have a task created, but before the agent has a chance to accept it. In this case agents experience that when they try to accept the task it hangs for around 5 minutes before opening up in a closed conversation state and allowing them to end the task.

Orginally, we reported that there's an issue after the conversation has been parked and the customer replies to it, but in the meantime we've observed the very same issue when the conversation is transferred to another agent. Therefore, for the sake of simplicity, we'll focus on the transfer scenario in this example as the Conversation Transfer plugin is available in the Plugin Library.

The repository contains a minimum reproducible example for the issue. It includes a client app which is a fork of the [Conversations Demo Web App](https://github.com/twilio/twilio-conversations-demo-react) with the button to close the conversation added.

## Steps to reproduce

### Prerequisites

1. Clone the repository
2. Install the "Conversation Transfer" plugin from the Plugin Library
3. Follow the instructions in the README.md of the `/client-app` folder to set up the client app
  - Add the client app's serverless function
  - Launch the client app locally

### Reproduce the issue

1. Open the client app
2. (as a customer) Start a chat with the agent
3. (as an agent) Accept the task
4. (as an agent) Transfer the task to a queue
4. (as an agent) Observe that the task is transferred (the current task disappeared and a new task appeared in the queue)
5. (as a customer) Close the conversation
6. (as an agent) Observe that the task is still in the queue
7. (as an agent) Try to accept the task
8. (as an agent) Observe that it's not possible to accept the task
9. (as an agent) Click the Accept button a couple of times and wait for around 5 minutes
10. (as an agent) Observe that the task is finally accepted and the conversation is closed

## Expected behavior

The task should disappear from the queue as soon as the customer closes the conversation.
