require "bunny"

class Api::RabbitmqController < Api::ApplicationController
  def traffic
    connection = Bunny.new(
      hostname: ENV["DOMAIN"],
      port: ENV["RABBITMQ_PORT"],
      user: ENV["RABBITMQ_USER"],
      password: ENV["RABBITMQ_PASSWORD"],
      vhost: "/"
    )
    connection.start

    channel = connection.create_channel
    queue = channel.queue("model_fine_tune_requests", durable: true)

    queue_status = queue.status

    connection.close

    render json: {
      messages_ready: queue_status[:message_count],
      messages_unacknowledged: queue_status[:consumer_count]
    }
  end
end
