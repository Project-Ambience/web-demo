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

  describe "GET /api/inter_raters/response_pairs" do
    let(:ai_model) { create(:ai_model) }
    let(:other_model) { create(:ai_model) }

    let!(:first_convo)  { create(:conversation, ai_model: ai_model) }
    let!(:second_convo) { create(:conversation, ai_model: other_model) }

    let!(:older_inter_rater) do
      create(:inter_rater, ai_model: ai_model, first_conversation: first_convo, second_conversation: second_convo, created_at: 2.days.ago)
    end

    let!(:newer_inter_rater) do
      create(:inter_rater, ai_model: ai_model, first_conversation: first_convo, second_conversation: second_convo, created_at: 1.day.ago)
    end

    it "returns inter_raters ordered by created_at desc with full conversation data" do
      get "/api/inter_raters/response_pairs/#{ai_model.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json.length).to eq(2)

      expect(json.first).to include(
        "id" => newer_inter_rater.id,
        "first_conversation_id" => first_convo.id,
        "first_conversation_ai_model_name" => ai_model.name,
        "first_conversation_base_prompt" => first_convo.base_prompt,
        "first_conversation_first_response" => first_convo.first_response,
        "first_conversation_file_url" => first_convo.file_url,
        "first_conversation_file_name" => first_convo.file_name,
        "first_conversation_few_shot_template" => first_convo.few_shot_template,
        "second_conversation_id" => second_convo.id,
        "second_conversation_ai_model_name" => other_model.name,
        "second_conversation_base_prompt" => second_convo.base_prompt,
        "second_conversation_first_response" => second_convo.first_response,
        "second_conversation_file_url" => second_convo.file_url,
        "second_conversation_file_name" => second_convo.file_name,
        "second_conversation_few_shot_template" => second_convo.few_shot_template
      )
    end
  end
end
