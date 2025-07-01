require "rails_helper"

RSpec.describe "ModelFineTuneRequests", type: :request do
  let(:fine_tune_task) { create(:fine_tune_task) }
  let(:clinician_type) { create(:clinician_type) }
  let(:ai_model) { create(:ai_model, allow_fine_tune: true) }
  let(:file) do
    Rack::Test::UploadedFile.new(
      Rails.root.join("spec/fixtures/files/fine_tune_data.json"),
      "application/json"
    )
  end
  let(:valid_params) do
    {
      name: "Fine-tune model",
      description: "Testing fine-tune",
      fine_tune_task_id: fine_tune_task.id,
      clinician_type_id: clinician_type.id,
      ai_model_id: ai_model.id,
      file: file
    }
  end

  it "creates a new fine-tune request with valid data" do
    post "/api/model_fine_tune_requests", params: valid_params
    expect(response).to have_http_status(:created)
  end

  it "returns bad request if required params are missing" do
    post "/api/model_fine_tune_requests", params: valid_params.except(:name)
    expect(response).to have_http_status(:bad_request)
    expect(JSON.parse(response.body)["error"]).to include("Missing required parameter(s): name")
  end

  it "returns 404 if fine_tune_task is not found" do
    post "/api/model_fine_tune_requests", params: valid_params.merge(fine_tune_task_id: 0)
    expect(response).to have_http_status(:not_found)
  end

  it "returns 404 if clinician_type is not found" do
    post "/api/model_fine_tune_requests", params: valid_params.merge(clinician_type_id: 0)
    expect(response).to have_http_status(:not_found)
  end

  it "returns 404 if ai_model is not found" do
    post "/api/model_fine_tune_requests", params: valid_params.merge(ai_model_id: 0)
    expect(response).to have_http_status(:not_found)
  end

  it "creates a new fine-tune request with valid data" do
    expect {
      post "/api/model_fine_tune_requests", params: valid_params
    }.to change(ModelFineTuneRequest, :count).by(1)
    expect(response).to have_http_status(:created)
  end

  describe "POST /api/model_fine_tune_requests/update_status" do
    let(:ai_model) { create(:ai_model, allow_fine_tune: true) }
    let!(:model_fine_tune_request) { create(:model_fine_tune_request, ai_model: ai_model) }
    let(:update_params) do
      {
        id: model_fine_tune_request.id,
        status: "success"
      }
    end

    it "updates the status of a fine-tune request" do
      model_fine_tune_request.in_progress!
      post "/api/model_fine_tune_requests/update_status", params: update_params
      expect(response).to have_http_status(:ok)
      model_fine_tune_request.reload
      expect(model_fine_tune_request.status).to eq("done")
    end

    it "creates a new AI model when status is success" do
      model_fine_tune_request.in_progress!
      expect {
        post "/api/model_fine_tune_requests/update_status", params: update_params
      }.to change(AiModel, :count).by(1)
    end

    it "updates new ai model" do
      model_fine_tune_request.in_progress!
      post "/api/model_fine_tune_requests/update_status", params: update_params
      expect(model_fine_tune_request.reload.new_ai_model_id).to eq(AiModel.last.id)
    end

    context "when status is fail" do
      let(:update_params) do
        {
          id: model_fine_tune_request.id,
          status: "fail"
        }
      end

      it "updates the status to failed" do
        model_fine_tune_request.in_progress!
        post "/api/model_fine_tune_requests/update_status", params: update_params
        expect(response).to have_http_status(:ok)
        model_fine_tune_request.reload
        expect(model_fine_tune_request.status).to eq("failed")
      end
    end
  end
end
