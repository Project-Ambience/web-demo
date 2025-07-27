# frozen_string_literal: true

# This script simulates a fine-tuning worker. It connects to RabbitMQ,
# consumes 6 messages from the fine-tuning queue, and updates their status
# via the callback URL to simulate a full lifecycle for each request.
#
# Usage:
# 1. Ensure your Rails server is running.
# 2. Make sure you have 6 messages in the 'model_fine_tune_requests' queue.
# 3. Run this script from your Rails root directory:
#    rails runner simulate_finetune_worker.rb

require 'bunny'
require 'httparty'
require 'json'

class FineTuneSimulator
  # Configuration - Fetches details from your Rails environment
  RABBITMQ_CONFIG = {
    hostname: ENV.fetch('DOMAIN', 'localhost'),
    port: ENV.fetch('RABBITMQ_PORT', 5672),
    user: ENV.fetch('RABBITMQ_USER', 'guest'),
    password: ENV.fetch('RABBITMQ_PASSWORD', 'guest'),
    vhost: '/'
  }.freeze
  QUEUE_NAME = ENV.fetch('MODEL_FINE_TUNE_REQUEST_QUEUE_NAME', 'model_fine_tune_requests').freeze
  SIMULATION_DELAY = 1.5 # Seconds to wait between status updates to make it visible on the UI

  def run
    puts "Starting Fine-Tune Simulator..."
    puts "Connecting to RabbitMQ at #{RABBITMQ_CONFIG[:hostname]}..."

    connection = Bunny.new(RABBITMQ_CONFIG)
    connection.start

    channel = connection.create_channel
    queue = channel.queue(QUEUE_NAME, durable: true)

    puts "Successfully connected. Waiting for messages in '#{QUEUE_NAME}'."

    (1..6).each do |request_number|
      delivery_info, _properties, payload = queue.pop(manual_ack: true)

      if payload.nil?
        puts "\nQueue is empty. No more messages to process. Exiting."
        break
      end

      process_message(request_number, payload)
      channel.ack(delivery_info.delivery_tag)
    end

  rescue Interrupt => _
    puts "\nSimulator interrupted. Shutting down."
  rescue Bunny::TCPConnectionFailedForAllHosts => e
    puts "\nError: Could not connect to RabbitMQ."
    puts "Please ensure RabbitMQ is running and credentials in your .env file are correct."
    puts "Details: #{e.message}"
  ensure
    connection&.close
    puts "Connection closed. Simulator finished."
  end

  private

  def process_message(request_number, payload)
    data = JSON.parse(payload, symbolize_names: true)
    request_id = data[:fine_tune_request_id]
    callback_url = data[:callback_url]

    puts "\n[#{Time.now.strftime('%H:%M:%S')}] Consumed Request ##{request_number} (ID: #{request_id})"

    case request_number
    when 1
      simulate_success(request_id, callback_url)
    when 2
      simulate_failure(request_id, callback_url)
    when 3
      simulate_in_progress(request_id, callback_url)
    when 4
      simulate_queued(request_id, callback_url)
    when 5
      simulate_validation_failed(request_id, callback_url)
    when 6
      simulate_validating(request_id)
    end
  end

  def simulate_success(id, url)
    puts "  -> Simulating a SUCCESSFUL job."
    update_status(id, url, 'validation_succeeded')
    update_status(id, url, 'processing_started')
    update_status(id, url, 'success', adapter_path: "simulated/path/to/adapter/#{id}")
    puts "  -> Status: DONE"
  end

  def simulate_failure(id, url)
    puts "  -> Simulating a FAILED job."
    update_status(id, url, 'validation_succeeded')
    update_status(id, url, 'processing_started')
    update_status(id, url, 'fail', error: "Simulation: Inference process ran out of memory during training.")
    puts "  -> Status: FAILED"
  end

  def simulate_in_progress(id, url)
    puts "  -> Simulating an IN PROGRESS job."
    update_status(id, url, 'validation_succeeded')
    update_status(id, url, 'processing_started')
    puts "  -> Status: IN PROGRESS"
  end

  def simulate_queued(id, url)
    puts "  -> Simulating a QUEUED job."
    update_status(id, url, 'validation_succeeded')
    puts "  -> Status: QUEUED"
  end

  def simulate_validation_failed(id, url)
    puts "  -> Simulating a VALIDATION FAILED job."
    update_status(id, url, 'validation_failed', error: "Simulation: Dataset format mismatch. Expected 'input' and 'output' keys.")
    puts "  -> Status: VALIDATION FAILED"
  end

  def simulate_validating(id)
    puts "  -> Simulating a VALIDATING job (no callback)."
    puts "  -> Status: VALIDATING"
  end

  def update_status(id, url, status, details = {})
    print "     - Updating to '#{status}'..."
    sleep SIMULATION_DELAY

    body = { id: id, status: status }.merge(details).to_json
    headers = { 'Content-Type' => 'application/json' }
    response = HTTParty.post(url, body: body, headers: headers)

    if response.success?
      puts " OK (200)"
    else
      puts " FAILED (#{response.code})"
      puts "       Response: #{response.body}"
    end
  end
end

FineTuneSimulator.new.run
