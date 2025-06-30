require "bunny"

class MessagePublisher
  def self.publish(payload, queue)
    connection = Bunny.new(hostname: "rabbitmq")
    connection.start
    channel = connection.create_channel
    queue = channel.queue(queue, durable: true)
    secret = Rails.application.credentials.hmac_secret
    json_payload_to_sign = payload.to_json
    signature = OpenSSL::HMAC.hexdigest("SHA256", secret, json_payload_to_sign)
    final_payload = payload.merge(signature: signature).to_json
    queue.publish(final_payload, persistent: true)
    connection.close
  end
end
