require 'rails_helper'

RSpec.describe "Api::ConversationsController", type: :request do
  let!(:base_model) { create(:ai_model, name: "gpt-4-base") }
  let!(:ai_model) { create(:ai_model, name: "GPT-4", base_model_id: base_model.id) }
  let!(:conversation1) { create(:conversation, title: "Convo A", ai_model: ai_model, status: "awaiting_prompt") }
  let!(:conversation2) { create(:conversation, title: "Convo B", ai_model: ai_model, status: "awaiting_feedback") }
  let!(:conversation3) { create(:conversation, title: "Convo C", ai_model: ai_model, status: "awaiting_rejection_comment") }
  let!(:conversation4) { create(:conversation, title: "Convo D", ai_model: ai_model, status: "completed") }
  let!(:conversation5) { create(:conversation, title: "Convo E", ai_model: base_model, status: "completed") }

  describe "GET /api/conversations" do
    it "returns all conversations with AI model details" do
      get "/api/conversations"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json.size).to eq(Conversation.count)

      first_convo = json.first

      expect(first_convo).to include(
        "id",
        "title",
        "status",
        "updated_at",
        "ai_model",
        "base_prompt",
        "first_response",
        "file_url",
        "file_name",
        "few_shot_template"
      )

      expect(first_convo["ai_model"]).to include(
        "name",
        "base_model"
      )
    end
  end

  describe "GET /api/conversations/by_ai_model" do
    it "returns conversations for a given ai_model_id" do
      get "/api/conversations/by_ai_model/#{base_model.id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to eq(1)

      first_convo = json.first

      expect(first_convo).to include(
        "id",
        "title",
        "status",
        "updated_at",
        "ai_model",
        "base_prompt",
        "first_response",
        "file_url",
        "file_name",
        "few_shot_template"
      )

      expect(first_convo["ai_model"]).to include(
        "name" => base_model.name,
        "base_model" => nil
      )
    end
  end

  describe "GET /api/conversations/:id" do
    it "returns a specific conversation with messages" do
      get "/api/conversations/#{conversation1.id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["id"]).to eq(conversation1.id)
      expect(json["messages"]).to be_an(Array)
    end
  end

  describe "POST /api/conversations" do
    it "creates a new conversation" do
      expect {
        post "/api/conversations", params: {
          conversation: { title: "New Convo", ai_model_id: ai_model.id }
        }
      }.to change(Conversation, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it "returns errors if invalid" do
      post "/api/conversations", params: { conversation: { title: "" } }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PUT /api/conversations/:id" do
    it "updates the conversation" do
      put "/api/conversations/#{conversation1.id}", params: {
        conversation: { title: "Updated Title" }
      }
      expect(response).to have_http_status(:ok)
      expect(conversation1.reload.title).to eq("Updated Title")
    end
  end

  describe "DELETE /api/conversations/:id" do
    it "deletes the conversation" do
      expect {
        delete "/api/conversations/#{conversation1.id}"
      }.to change(Conversation, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end

  describe "POST /api/conversations/:id/accept_feedback" do
    it "marks a conversation as completed" do
      post "/api/conversations/#{conversation2.id}/accept_feedback"
      expect(response).to have_http_status(:ok)
      expect(conversation2.reload.status).to eq("completed")
    end

    it "returns error if not awaiting_feedback" do
      post "/api/conversations/#{conversation1.id}/accept_feedback"
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/conversations/:id/reject_feedback" do
    it "marks a conversation as awaiting_rejection_comment" do
      post "/api/conversations/#{conversation2.id}/reject_feedback"
      expect(response).to have_http_status(:ok)
      expect(conversation2.reload.status).to eq("awaiting_rejection_comment")
    end

    it "returns error if not awaiting_feedback" do
      post "/api/conversations/#{conversation1.id}/reject_feedback"
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
