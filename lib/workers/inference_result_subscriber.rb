require 'bunny'

class InferenceResultSubscriber
  def self.start
    require_relative '../../config/environment'

    host = '128.16.12.219'
    port = 5672
    user = 'guest'
    pass = 'guest'
    vhost = '/'

    connection = nil

    begin
      connection = Bunny.new(hostname: host, port: port, user: user, password: pass, vhost: vhost)
      connection.start
      channel = connection.create_channel

      input_queue_name = "inference_results"
      queue = channel.queue(input_queue_name, durable: true)

      puts " [✔] Connected to RabbitMQ. Waiting for inference results in '#{input_queue_name}'. To exit press CTRL+C"

      queue.subscribe(manual_ack: true, block: true) do |delivery_info, properties, body|
        puts " [x] Received raw data: #{body}"

        begin
          data = JSON.parse(body)
          conversation_id = data["conversation_id"]
          result_content = data["result"]

          conversation = Conversation.find_by(id: conversation_id)

          if conversation
            message = conversation.messages.create(
              role: "assistant",
              content: result_content
            )

            if message.persisted?
              puts " [✔] Saved assistant message to conversation #{conversation_id}"

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

          channel.ack(delivery_info.delivery_tag)
          puts " [✔] Acknowledged message."

        rescue JSON::ParserError => e
          puts " [!] Malformed JSON received. Rejecting message. Error: #{e.message}"
          channel.reject(delivery_info.delivery_tag, false)
        rescue => e
          puts " [!] An unexpected error occurred while processing message: #{e.message}"
          puts e.backtrace.join("\n")
          channel.reject(delivery_info.delivery_tag, false)
        end
      end

    rescue Bunny::TCPConnectionFailedForAllHosts, Bunny::AuthenticationFailureError => e
      puts " [!] RabbitMQ connection failed: #{e.message}"
    rescue Interrupt => _
      puts "\n [i] Gracefully shutting down..."
    ensure
      if connection && connection.open?
        connection.close
        puts " [i] RabbitMQ connection closed."
      end
    end
  end
end

if __FILE__ == $0
  InferenceResultSubscriber.start
end
