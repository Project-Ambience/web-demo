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

  describe "POST /api/model_fine_tune_requests/update_status" do
    let!(:model_fine_tune_request) { create(:model_fine_tune_request, :with_tunable_model, task: "summarise", fine_tuning_notes: "some note") }

    it "updates status, broadcasts via ActionCable, and returns a success message" do
      model_fine_tune_request.fine_tuning!

      expect {
        post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "success", adapter_path: "path/to/adapter" }
      }.to have_broadcasted_to("fine_tune_status_channel")
        .with(hash_including(:statistics, updated_request: hash_including("id" => model_fine_tune_request.id, "status" => "done")))

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq({ "message" => "Status updated successfully" })
      expect(model_fine_tune_request.reload.status).to eq("done")
    end

    context "when creating a new AiModel on success" do
      before { model_fine_tune_request.fine_tuning! }

      it "creates a new AI model" do
        expect {
          post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "success", adapter_path: "path/to/adapter" }
        }.to change(AiModel, :count).by(1)
      end

      it "links the new AiModel ID to the request" do
        post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "success", adapter_path: "path/to/adapter" }
        expect(model_fine_tune_request.reload.new_ai_model_id).to eq(AiModel.last.id)
      end

      it "creates the new AI model with correct attributes" do
        post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "success", adapter_path: "path/to/adapter" }
        new_ai_model = AiModel.last
        request_ai_model = model_fine_tune_request.ai_model
        expect(new_ai_model.name).to eq(model_fine_tune_request.name)
        expect(new_ai_model.description).to eq(model_fine_tune_request.description)
        expect(new_ai_model.clinician_type_id).to eq(model_fine_tune_request.clinician_type_id)
        expect(new_ai_model.base_model_id).to eq(request_ai_model.id)
        expect(new_ai_model.adapter_path).to eq("path/to/adapter")
        expect(new_ai_model.path).to eq(request_ai_model.path)
        expect(new_ai_model.keywords).to eq(request_ai_model.keywords)
        expect(new_ai_model.speciality).to eq(model_fine_tune_request.task)
        expect(new_ai_model.family).to eq(request_ai_model.family)
        expect(new_ai_model.parameter_size).to eq(request_ai_model.parameter_size)
        expect(new_ai_model.fine_tuning_notes).to eq(model_fine_tune_request.fine_tuning_notes)
      end
    end

    context "when status is fail" do
      it "updates the status to failed" do
        model_fine_tune_request.fine_tuning!
        post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "fail" }
        expect(response).to have_http_status(:ok)
        expect(model_fine_tune_request.reload.status).to eq("failed")
      end
    end

    context "with intermediate status updates" do
      it "transitions from waiting_for_validation to validating" do
        model_fine_tune_request.waiting_for_validation!
        post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "validation_started" }
        expect(model_fine_tune_request.reload).to be_validating
      end

      it "transitions from validating to waiting_for_fine_tune" do
        model_fine_tune_request.validating!
        post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "validation_succeeded" }
        expect(model_fine_tune_request.reload).to be_waiting_for_fine_tune
      end

      it "transitions from validating to validation_failed" do
        model_fine_tune_request.validating!
        post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "validation_failed", error: "Bad data" }
        request = model_fine_tune_request.reload
        expect(request).to be_validation_failed
        expect(request.error_message).to eq("Bad data")
      end
    end

    context "with an invalid status" do
      it "returns an unprocessable_entity error" do
        post "/api/model_fine_tune_requests/update_status", params: { id: model_fine_tune_request.id, status: "invalid_status" }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
