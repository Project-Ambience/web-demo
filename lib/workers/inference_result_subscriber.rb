# lib/workers/inference_result_subscriber.rb
require "bunny"

class InferenceResultSubscriber
  def self.start
    # Ensure this code can be loaded by the Rails runner
    # by requiring the environment.
    require_relative '../../config/environment'

    connection = Bunny.new(hostname: "rabbitmq") # Docker service name
    connection.start
    channel = connection.create_channel

    input_queue_name = "inference_results"
    queue = channel.queue(input_queue_name, durable: true)

    puts " [*] Waiting for inference results in #{input_queue_name}. To exit press CTRL+C"

    begin
      queue.subscribe(manual_ack: true, block: true) do |delivery_info, properties, body|
        puts " [x] Received #{body}"

        data = JSON.parse(body)
        conversation_id = data["conversation_id"]
        result = data["result"]

        conversation = Conversation.find_by(id: conversation_id)

        if conversation
          # Create a new message for the assistant's response
          message = conversation.messages.create(
            role: "assistant",
            content: result
          )

          if message.persisted?
            puts " [✔] Saved assistant message to conversation #{conversation_id}"

            # Broadcast the new message via Action Cable.
            # Rails will now correctly autoload ConversationChannel.
            ConversationChannel.broadcast_to(
              conversation,
              { message: message.as_json }
            )
            puts " [✔] Broadcasted message to ConversationChannel"
          else
            puts " [!] Failed to save message: #{message.errors.full_messages.join(', ')}"
          end
        else
          puts " [!] Conversation with ID #{conversation_id} not found."
        end

        channel.ack(delivery_info.delivery_tag)
      end
    rescue Interrupt => _
      connection.close
      puts " [✔] Connection closed."
    end
  end
end

# This allows the script to be run directly
InferenceResultSubscriber.start if __FILE__ == $0
