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

  before do
    allow(MessagePublisher).to receive(:publish)
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

  describe "Model Fine-Tune Lifecycle Simulation" do
    let(:clinician_type) { create(:clinician_type) }
    let(:base_model) { create(:ai_model, allow_fine_tune: true) }
    let(:unformatted_data) do
      [
        { "instruction" => "i1", "input" => "a", "response" => "b" },
        { "instruction" => "i2", "input" => "a1", "response" => "b2" }
      ]
    end
    let(:formatted_data) do
      [
        { "text" => "### Instruction:i1### Input:a### Response:b" },
        { "text" => "### Instruction:i2### Input:a1### Response:b2" }
      ]
    end

    before do
      allow(MessagePublisher).to receive(:publish)
    end

    let!(:waiting_for_formatting_request) do
      create(:model_fine_tune_request,
             ai_model: base_model,
             clinician_type: clinician_type,
             name: "Request Waiting for Formatting",
             status: :waiting_for_formatting,
             fine_tune_data: unformatted_data)
    end

    let!(:formatting_failed_request) do
      create(:model_fine_tune_request,
             ai_model: base_model,
             clinician_type: clinician_type,
             name: "Request Formatting Failed",
             status: :formatting_failed,
             error_message: "Dataset contains invalid characters.")
    end

    let!(:awaiting_confirmation_request) do
      create(:model_fine_tune_request,
             ai_model: base_model,
             clinician_type: clinician_type,
             name: "Request Awaiting Confirmation",
             status: :awaiting_confirmation,
             fine_tune_data: formatted_data)
    end

    let!(:waiting_for_fine_tune_request) do
      create(:model_fine_tune_request,
             ai_model: base_model,
             clinician_type: clinician_type,
             name: "Request Waiting for Fine-Tune",
             status: :waiting_for_fine_tune,
             fine_tune_data: formatted_data)
    end

    let!(:failed_request) do
      create(:model_fine_tune_request,
             ai_model: base_model,
             clinician_type: clinician_type,
             name: "Request Fine-Tune Failed",
             status: :failed,
             error_message: "Training failed due to resource constraints.")
    end

    let!(:done_request) do
      req = create(:model_fine_tune_request,
                   ai_model: base_model,
                   clinician_type: clinician_type,
                   name: "Request Done",
                   status: :done)
      new_model = create(:ai_model,
                         name: req.name,
                         base_model: req.ai_model,
                         clinician_type: req.clinician_type)
      req.update_column(:new_ai_model_id, new_model.id)
      req
    end

    it "returns a collection of requests, with one in each status" do
      get "/api/model_fine_tune_requests", params: { status: "all", page: 1, per: 10 }

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      requests = json_response["requests"]

      expect(requests.count).to eq(6)
      expect(requests.pluck("name")).to contain_exactly(
        "Request Waiting for Formatting",
        "Request Formatting Failed",
        "Request Awaiting Confirmation",
        "Request Waiting for Fine-Tune",
        "Request Fine-Tune Failed",
        "Request Done"
      )

      confirmation_req_data = requests.find { |r| r["status"] == "awaiting_confirmation" }
      expect(confirmation_req_data["fine_tune_data"]).to eq(formatted_data.map(&:deep_stringify_keys))
    end
  end
end
