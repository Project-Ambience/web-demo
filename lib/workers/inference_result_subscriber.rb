# lib/workers/inference_result_subscriber.rb
require "bunny"

class InferenceResultSubscriber
  def self.start
    # Ensure this code can be loaded by the Rails runner
    # by requiring the environment.
    require_relative '../../config/environment'

    # Use the Docker service name 'rabbitmq' for the hostname,
    # as it's more portable than a hardcoded IP.
    connection = Bunny.new(hostname: "rabbitmq")
    connection.start
    channel = connection.create_channel

    input_queue_name = "inference_results"
    queue = channel.queue(input_queue_name, durable: true)

    puts " [*] Waiting for inference results in #{input_queue_name}. To exit press CTRL+C"

    begin
      # Use manual_ack: true for reliability. We'll only acknowledge a message
      # after we've successfully processed it.
      queue.subscribe(manual_ack: true, block: true) do |delivery_info, properties, body|
        puts " [x] Received raw data: #{body}"

        begin
          data = JSON.parse(body)
          conversation_id = data["conversation_id"]
          result_content = data["result"]

          # Find the conversation to which this result belongs.
          conversation = Conversation.find_by(id: conversation_id)

          if conversation
            # Create a new message for the assistant's response.
            message = conversation.messages.create(
              role: "assistant",
              content: result_content
            )

            if message.persisted?
              puts " [✔] Saved assistant message to conversation #{conversation_id}"

              # Broadcast the new message to the specific conversation channel
              # so the frontend receives it in real-time.
              ConversationChannel.broadcast_to(
                conversation,
                { message: message.as_json }
              )
              puts " [✔] Broadcasted message to ConversationChannel for conversation #{conversation.id}"
            else
              puts " [!] Failed to save message: #{message.errors.full_messages.join(', ')}"
            end
          else
            puts " [!] Conversation with ID #{conversation_id} not found."
          end

          # Acknowledge the message was successfully processed.
          channel.ack(delivery_info.delivery_tag)
          puts " [✔] Acknowledged message."

        rescue JSON::ParserError => e
          puts " [!] Failed to parse JSON message: #{e.message}"
          # Reject the message as it's malformed and cannot be processed.
          channel.reject(delivery_info.delivery_tag, false)
        rescue => e
          puts " [!] An unexpected error occurred: #{e.message}"
          puts e.backtrace.join("\n")
          # Reject the message so it doesn't get re-queued in a loop.
          channel.reject(delivery_info.delivery_tag, false)
        end
      end
    rescue Interrupt => _
      connection.close
      puts "\n [✔] Connection closed gracefully."
    end
  end
end

# This allows the script to be run directly from the command line,
# for example: `bundle exec rails runner lib/workers/inference_result_subscriber.rb`
InferenceResultSubscriber.start if __FILE__ == $0
