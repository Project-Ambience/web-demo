require 'rails_helper'

RSpec.describe Api::InterRatersController, type: :request do
  let(:base_ai_model) { create(:ai_model) }
  let(:ai_model) { create(:ai_model, base_model: base_ai_model) }
  let(:conversation1) { create(:conversation, ai_model: ai_model, status: "completed") }
  let(:conversation2) { create(:conversation, ai_model: ai_model, status: "completed") }

  describe "POST /api/inter_raters" do
    let(:valid_params) do
      {
        inter_rater: {
          ai_model_id: ai_model.id,
          first_conversation_id: conversation1.id,
          second_conversation_id: conversation2.id
        }
      }
    end

    it "creates a new InterRater and returns 201" do
      expect {
        post "/api/inter_raters", params: valid_params
      }.to change(InterRater, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "returns 422 if required fields are missing" do
      invalid_params = { inter_rater: { ai_model_id: "" } }

      post "/api/inter_raters", params: invalid_params

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)).to include("errors")
    end
  end
end
