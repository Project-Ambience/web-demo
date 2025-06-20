import pika
import time
import requests
import json
import os
import hmac
import hashlib

def process_message(channel, method, properties, body):
    """
    This function is the heart of the worker. It's called every time a new
    message (job) is received from the 'user_prompts' queue.

    Args:
        channel: The channel instance from Pika.
        method:  Delivery information for the message.
        properties: Properties of the message.
        body: The content of the message, a JSON string.
    """
    try:
        # Step 1: Parse the incoming job from the Rails application.
        data = json.loads(body)
        print(f" [x] Received job for conversation_id: {data.get('conversation_id')}")

        # Safely get the prompt from the received data.
        prompt = data.get('prompt', 'a prompt was not provided')

        # ======================================================================
        # Generate AI response
        #
        # CURRENT SIMULATION (DELETE THIS BLOCK)
        print(f" [>] Simulating AI inference for prompt: '{prompt}'")
        time.sleep(2) # Simulates the time it takes for the AI to respond.
        ai_response_content = f"This is a simulated AI response to: '{prompt}'"
        # 
        # ======================================================================


        # Step 3: Send the AI's response back to the Rails application.
        callback_url = os.getenv('RAILS_API_CALLBACK_URL')
        secret = os.getenv('HMAC_SECRET')

        if not secret:
            print(" [!] CRITICAL: HMAC_SECRET environment variable not set. Cannot proceed.")
            # Negative-acknowledge the message so it doesn't get stuck in the queue.
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        # Prepare the JSON payload to send back.
        response_payload = {
            "conversation_id": data['conversation_id'],
            "ai_content": ai_response_content
        }
        json_payload = json.dumps(response_payload).encode('utf-8')

        # Create a security signature (HMAC) to prove the request is from us.
        our_signature = hmac.new(secret.encode('utf-8'), json_payload, hashlib.sha256).hexdigest()
        headers = {
            'Content-Type': 'application/json',
            'X-Signature': f'sha256={our_signature}'
        }

        # Make the HTTP POST request to the Rails API callback URL.
        response = requests.post(callback_url, data=json_payload, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes (like 4xx or 5xx)

        print(f" [✔] Successfully sent result to Rails API, status: {response.status_code}")

        # Step 3: Acknowledge the message.
        # This tells RabbitMQ that the job was processed successfully and can be
        # safely removed from the queue.
        channel.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        # If any error occurs during the process, print the error.
        print(f" [!] An unexpected error occurred: {e}")
        # Negative-acknowledge the message. 'requeue=False' prevents it from
        # being retried indefinitely and can be sent to a dead-letter queue if configured.
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    """
    Main function to set up the connection to RabbitMQ and start consuming
    messages. Includes a retry loop to handle startup race conditions.
    """
    retry_interval = 5
    while True:
        try:
            print(' [*] Connecting to RabbitMQ...')
            # The hostname 'rabbitmq' is the service name from docker-compose.dev.yml
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
            print(' [+] Connection to RabbitMQ established!')
            break  # Exit loop if connection is successful
        except pika.exceptions.AMQPConnectionError:
            # This handles the case where the worker starts before RabbitMQ is ready.
            print(f" [!] Connection failed. Retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)

    # Create a channel and declare the queue we will be listening to.
    channel = connection.channel()
    channel.queue_declare(queue='user_prompts', durable=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')

    # Tell the channel to call the 'process_message' function for each message.
    channel.basic_consume(queue='user_prompts', on_message_callback=process_message)

    # Start the endless loop of listening for messages.
    channel.start_consuming()


if __name__ == '__main__':
    main()