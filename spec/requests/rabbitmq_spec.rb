require 'rails_helper'

RSpec.describe "Api::RabbitmqController", type: :request do
  describe "GET /api/rabbitmq/traffic" do
    let(:mock_connection) { instance_double(Bunny::Session) }
    let(:mock_channel) { instance_double(Bunny::Channel) }
    let(:mock_queue) { instance_double(Bunny::Queue) }

    before do
      allow(Bunny).to receive(:new).and_return(mock_connection)
      allow(mock_connection).to receive(:start)
      allow(mock_connection).to receive(:create_channel).and_return(mock_channel)
      allow(mock_channel).to receive(:queue).with("model_fine_tune_requests", durable: true).and_return(mock_queue)
      allow(mock_queue).to receive(:status).and_return({ message_count: 7, consumer_count: 2 })
      allow(mock_connection).to receive(:close)
    end

    it "returns RabbitMQ queue traffic data as JSON" do
      get "/api/rabbitmq/traffic"

      json = JSON.parse(response.body)

      expect(json["messages_ready"]).to eq(7)
      expect(json["messages_unacknowledged"]).to eq(2)
    end
  end
end
