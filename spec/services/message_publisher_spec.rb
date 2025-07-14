require "rails_helper"

RSpec.describe MessagePublisher do
  describe ".publish" do
    let(:payload) { { message: "Hello" } }
    let(:queue_name) { "test_queue" }
    let(:mock_connection) { instance_double(Bunny::Session) }
    let(:mock_channel) { instance_double(Bunny::Channel) }
    let(:mock_queue) { instance_double(Bunny::Queue) }

    before do
      allow(ENV).to receive(:[]).with("DOMAIN").and_return("localhost")
      allow(ENV).to receive(:[]).with("RABBITMQ_PORT").and_return("5672")
      allow(ENV).to receive(:[]).with("RABBITMQ_USER").and_return("guest")
      allow(ENV).to receive(:[]).with("RABBITMQ_PASSWORD").and_return("guest")

      allow(Bunny).to receive(:new).and_return(mock_connection)
      allow(mock_connection).to receive(:start)
      allow(mock_connection).to receive(:create_channel).and_return(mock_channel)
      allow(mock_connection).to receive(:close)

      allow(mock_channel).to receive(:queue).with(queue_name, durable: true).and_return(mock_queue)
      allow(mock_queue).to receive(:publish)
    end

    it "connects to RabbitMQ with correct connection parameters" do
      expect(Bunny).to receive(:new).with(
        hostname: "localhost",
        port: "5672",
        user: "guest",
        password: "guest",
        vhost: "/"
      ).and_return(mock_connection)
      described_class.publish(payload, queue_name)
    end

    it "connects and publishes the message payload as JSON" do
      expected_payload = payload.to_json

      described_class.publish(payload, queue_name)

      expect(mock_connection).to have_received(:start)
      expect(mock_channel).to have_received(:queue).with(queue_name, durable: true)
      expect(mock_queue).to have_received(:publish).with(expected_payload, persistent: true)
      expect(mock_connection).to have_received(:close)
    end
  end
end
