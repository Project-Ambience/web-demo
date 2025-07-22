require 'rails_helper'

RSpec.describe Api::InterRatersController, type: :request do
  let(:base_ai_model) { create(:ai_model) }
  let(:ai_model) { create(:ai_model, base_model: base_ai_model) }

  describe "POST /api/inter_raters" do
    let(:valid_params) do
      {
        inter_rater: {
          prompt: "Test prompt",
          first_response: "Fine-tuned response",
          second_response: "Base model response",
          file_url: "https://example.com/test.pdf",
          ai_model_id: ai_model.id,
          evaluation_category: "fine_tune_model",
          comment: "Looks good",
          rating: "neutral"
        }
      }
    end

    it "creates a new InterRater and returns 201" do
      expect {
        post "/api/inter_raters", params: valid_params
      }.to change(InterRater, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)).to include("prompt" => "Test prompt")
    end

    it "returns 422 if required fields are missing" do
      invalid_params = { inter_rater: { prompt: "" } }

      post "/api/inter_raters", params: invalid_params

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)).to include("errors")
    end
  end

  describe "GET /api/inter_raters/fine_tune_model/:ai_model_id" do
    let(:conversation) do
      create(:conversation, ai_model: ai_model, status: "completed")
    end

    before do
      create(:message, conversation: conversation, role: "user", content: "User prompt")
      create(:message, conversation: conversation, role: "assistant", content: "FT model response")
      create(:message, conversation: conversation, role: "assistant-base-model", content: "Base model response")
    end

    it "returns fine-tune evaluation data" do
      get "/api/inter_raters/fine_tune_model/#{ai_model.id}"

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)

      expect(data.first["prompt"]).to eq("User prompt")
      expect(data.first["response"]).to eq("FT model response")
      expect(data.first["response_base_model"]).to eq("Base model response")
    end
  end
end
