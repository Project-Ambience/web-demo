require "rails_helper"

RSpec.describe "MessageRequests", type: :request do
  let!(:ai_model) { create(:ai_model, path: "some path") }
  let!(:conversation) { create(:conversation, ai_model: ai_model) }

  describe "POST /api/conversations/:conversation_id/messages" do
    let(:valid_params) do
      {
        conversation_id: conversation.id,
        message: { content: "Hello, this is a test message." }
      }
    end

    before do
      allow(MessagePublisher).to receive(:publish)
    end

    it "creates a new message with valid data" do
      post "/api/conversations/#{conversation.id}/messages", params: valid_params
      expect(response).to have_http_status(:created)
    end

    it "create new message" do
      expect {
        post "/api/conversations/#{conversation.id}/messages", params: valid_params
      }.to change { Message.count }.by(1)
    end

    it "returns the created message content" do
      post "/api/conversations/#{conversation.id}/messages", params: valid_params
      expect(response.body).to include("Hello, this is a test message.")
    end

    it "publishes the message to the queue" do
      post "/api/conversations/#{conversation.id}/messages", params: valid_params
      expect(MessagePublisher).to have_received(:publish).with({ conversation_id: conversation.id, path: "some path", prompt: "Hello, this is a test message." }, "user_prompts")
    end
  end
end
