require "bunny"

class MessagePublisher
  def self.publish(payload, queue)
    connection = Bunny.new(
      hostname: ENV["DOMAIN"],
      port: ENV["RABBITMQ_PORT"],
      user: ENV["RABBITMQ_USER"],
      password: ENV["RABBITMQ_PASSWORD"],
      vhost: "/"
    )
    connection.start
    channel = connection.create_channel
    queue = channel.queue(queue, durable: true)
    json_payload = payload.to_json
    queue.publish(json_payload, persistent: true)
    connection.close
  end
end
