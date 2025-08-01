require "rails_helper"

RSpec.describe Api::AiModelsController, type: :controller do
  describe "GET #index" do
    let!(:ai_model1) { create(:ai_model, name: "GPT-4") }
    let!(:ai_model2) { create(:ai_model, name: "Claude") }

    it "returns a success response" do
      get :index
      expect(response).to have_http_status(:ok)
    end

    it "returns all AI models as JSON" do
      get :index
      json = JSON.parse(response.body)

      expect(json.length).to eq(2)
      expect(json.map { |m| m["name"] }).to contain_exactly("GPT-4", "Claude")
    end
  end
end
