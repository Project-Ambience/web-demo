require "rails_helper"

RSpec.describe "MessageRequests", type: :request do
  let!(:ai_model) { create(:ai_model, path: "some path", adapter_path: "some adapter path", speciality: "summarise") }
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
      ENV["USER_PROMPT_QUEUE_NAME"] = "user_prompts"
    end

    it "creates a new message with valid data" do
      post "/api/conversations/#{conversation.id}/messages", params: valid_params
      expect(response).to have_http_status(:created)
    end

    it "creates a new message" do
      expect {
        post "/api/conversations/#{conversation.id}/messages", params: valid_params
      }.to change { Message.count }.by(1)
    end

    it "returns the created message content" do
      post "/api/conversations/#{conversation.id}/messages", params: valid_params
      expect(response.body).to include("Hello, this is a test message.")
    end

    context "when publishing the message to the queue" do
      before do
        create(:message, conversation: conversation, role: "assistant", content: "Hi there!", created_at: 1.minute.ago)
      end

      context "when no few-shot template is provided" do
        it "publishes the message with a nil few_shot_template" do
          post "/api/conversations/#{conversation.id}/messages", params: valid_params
          conversation.reload

          expected_input_history = conversation.messages.order(created_at: :asc).map do |msg|
            { role: msg.role, content: msg.content }
          end

          expected_payload = {
            conversation_id: conversation.id,
            file_url: conversation.file_url,
            few_shot_template: nil,
            input: expected_input_history,
            base_model_path: "some path",
            adapter_path: "some adapter path",
            speciality: "summarise"
          }
          expect(MessagePublisher).to have_received(:publish).with(expected_payload, "user_prompts")
        end
      end

      context "when a few-shot template is provided" do
        let!(:template) { create(:few_shot_template) }
        let!(:example1) { create(:example, few_shot_template: template, input: "Q1", output: "A1") }
        let!(:example2) { create(:example, few_shot_template: template, input: "Q2", output: "A2") }
        let(:params_with_template) do
          {
            conversation_id: conversation.id,
            message: {
              content: "Hello, this is a test message with a template.",
              few_shot_template_id: template.id
            }
          }
        end

        it "publishes the message with the correct few_shot_template data" do
          post "/api/conversations/#{conversation.id}/messages", params: params_with_template
          conversation.reload

          expected_input_history = conversation.messages.order(created_at: :asc).map do |msg|
            { role: msg.role, content: msg.content }
          end

          expected_snapshot = {
            "name" => template.name,
            "description" => template.description,
            "examples" => [
              { "input" => "Q1", "output" => "A1" },
              { "input" => "Q2", "output" => "A2" }
            ]
          }

          expected_payload = {
            conversation_id: conversation.id,
            file_url: conversation.file_url,
            few_shot_template: expected_snapshot,
            input: expected_input_history,
            base_model_path: "some path",
            adapter_path: "some adapter path",
            speciality: "summarise"
          }

          expect(MessagePublisher).to have_received(:publish).with(expected_payload, "user_prompts")
          expect(conversation.few_shot_template).to eq(expected_snapshot)
        end
      end
    end
  end
end
