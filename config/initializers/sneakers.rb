require "sneakers"
require "sneakers/handlers/maxretry"

Sneakers.configure(
  amqp: "amqp://#{ENV["RABBITMQ_USERNAME"]}:#{ENV["RABBITMQ_PASSWORD"]}@#{ENV["DOMAIN"]}:#{ENV["RABBITMQ_PORT"]}",
  vhost: "/",
  exchange: "sneakers",
  exchange_type: :direct,
  workers: 1,
  threads: 1,
  handler: Sneakers::Handlers::Maxretry,
  retry_max_times: 5,
  retry_timeout: 5000,
  durable: true,
  ack: true,
  prefetch: 1,
  timeout_job_after: 30
)
