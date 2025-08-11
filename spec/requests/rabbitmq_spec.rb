require 'rails_helper'

RSpec.describe "Api::RabbitmqController", type: :request do
  describe "GET /api/rabbitmq/traffic" do
    let(:mock_connection) { instance_double(Bunny::Session) }
    let(:mock_channel) { instance_double(Bunny::Channel) }
    let(:mock_formatting_queue) { instance_double(Bunny::Queue) }
    let(:mock_finetune_queue) { instance_double(Bunny::Queue) }

    before do
      ENV["MODEL_FORMATTING_REQUEST_QUEUE_NAME"] = "formatting_queue_test"
      ENV["MODEL_FINE_TUNE_REQUEST_QUEUE_NAME"] = "finetune_queue_test"

      allow(Bunny).to receive(:new).and_return(mock_connection)
      allow(mock_connection).to receive(:start)
      allow(mock_connection).to receive(:create_channel).and_return(mock_channel)
      allow(mock_channel).to receive(:queue).with("formatting_queue_test", durable: true).and_return(mock_formatting_queue)
      allow(mock_channel).to receive(:queue).with("finetune_queue_test", durable: true).and_return(mock_finetune_queue)
      allow(mock_formatting_queue).to receive(:status).and_return({ message_count: 5, consumer_count: 1 })
      allow(mock_finetune_queue).to receive(:status).and_return({ message_count: 2, consumer_count: 0 })
      allow(mock_connection).to receive(:close)
    end

    it "returns RabbitMQ queue traffic data as JSON" do
      get "/api/rabbitmq/traffic"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json).to eq({
        "formatting" => {
          "messages_ready" => 5,
          "messages_unacknowledged" => 1
        },
        "fine_tuning" => {
          "messages_ready" => 2,
          "messages_unacknowledged" => 0
        }
      })
    end
  end
end
