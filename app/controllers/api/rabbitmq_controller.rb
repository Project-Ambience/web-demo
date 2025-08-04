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

    formatting_queue = channel.queue(ENV["MODEL_FORMATTING_REQUEST_QUEUE_NAME"], durable: true)
    fine_tuning_queue = channel.queue(ENV["MODEL_FINE_TUNE_REQUEST_QUEUE_NAME"], durable: true)

    formatting_status = formatting_queue.status
    fine_tuning_status = fine_tuning_queue.status

    connection.close

    render json: {
      formatting: {
        messages_ready: formatting_status[:message_count],
        messages_unacknowledged: formatting_status[:consumer_count]
      },
      fine_tuning: {
        messages_ready: fine_tuning_status[:message_count],
        messages_unacknowledged: fine_tuning_status[:consumer_count]
      }
    }
  end
end
