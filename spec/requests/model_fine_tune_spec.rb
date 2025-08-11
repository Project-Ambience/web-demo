require "rails_helper"

RSpec.describe "ModelFineTuneRequests", type: :request do
  let!(:fine_tune_task) { create(:fine_tune_task) }
  let!(:clinician_type) { create(:clinician_type) }
  let!(:ai_model) { create(:ai_model, allow_fine_tune: true) }
  let!(:file) do
    Rack::Test::UploadedFile.new(
      Rails.root.join("spec/fixtures/files/fine_tune_data.json"),
      "application/json"
    )
  end
  let!(:valid_params) do
    {
      name: "Test Fine-Tune",
      description: "A test request",
      fine_tune_task_id: fine_tune_task.id,
      clinician_type_id: clinician_type.id,
      ai_model_id: ai_model.id,
      file: file
    }
  end

  before do
    ENV["MODEL_FORMATTING_REQUEST_QUEUE_NAME"] = "test_formatting_queue"
    ENV["MODEL_FINE_TUNE_REQUEST_QUEUE_NAME"] = "test_finetune_queue"
    ENV["MODEL_FORMATTING_COMPLETE_CALLBACK_PATH"] = "/api/model_fine_tune_requests/formatting_complete"
    ENV["MODEL_FINE_TUNE_REQUEST_CALLBACK_PATH"] = "/api/model_fine_tune_requests/update_status"
    allow(MessagePublisher).to receive(:publish)
  end

  describe "POST /api/model_fine_tune_requests" do
    it "creates a new fine-tune request and returns a created status" do
      expect {
        post "/api/model_fine_tune_requests", params: valid_params
      }.to change(ModelFineTuneRequest, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(ModelFineTuneRequest.last.status).to eq("waiting_for_formatting")
    end
  end

  describe "POST /api/model_fine_tune_requests/formatting_complete" do
    let!(:request) { create(:model_fine_tune_request, :with_tunable_model, status: :waiting_for_formatting) }

    it "updates status to awaiting_confirmation on success" do
      post "/api/model_fine_tune_requests/formatting_complete", params: { id: request.id, status: "success", validated_dataset: [ { text: "formatted" } ] }
      expect(response).to have_http_status(:ok)
      expect(request.reload.status).to eq("awaiting_confirmation")
      expect(request.fine_tune_data).to eq([ { "text" => "formatted" } ])
    end

    it "updates status to formatting_failed on failure" do
      post "/api/model_fine_tune_requests/formatting_complete", params: { id: request.id, status: "fail", error: "Bad format" }
      expect(response).to have_http_status(:ok)
      expect(request.reload.status).to eq("formatting_failed")
      expect(request.error_message).to eq("Bad format")
    end
  end

  describe "POST /api/model_fine_tune_requests/:id/confirm_and_start_fine_tune" do
    let!(:request) do
      req = create(:model_fine_tune_request, :with_tunable_model)
      req.update_column(:status, :awaiting_confirmation) # Bypass callbacks to set status
      req
    end

    it "updates status to waiting_for_fine_tune and publishes to the fine-tune queue" do
      post "/api/model_fine_tune_requests/#{request.id}/confirm_and_start_fine_tune"

      expect(response).to have_http_status(:ok)
      expect(request.reload.status).to eq("waiting_for_fine_tune")
      expect(MessagePublisher).to have_received(:publish).with(hash_including(fine_tune_request_id: request.id), ENV["MODEL_FINE_TUNE_REQUEST_QUEUE_NAME"])
    end

    it "returns an error if the request is not awaiting confirmation" do
      request.fine_tuning_completed!
      post "/api/model_fine_tune_requests/#{request.id}/confirm_and_start_fine_tune"
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/model_fine_tune_requests/update_status" do
    let!(:request) do
      req = create(:model_fine_tune_request, :with_tunable_model)
      req.update_column(:status, :waiting_for_fine_tune) # Bypass callbacks to set status
      req
    end

    it "updates status to fine_tuning_completed on success and creates a new AiModel" do
      expect {
        post "/api/model_fine_tune_requests/update_status", params: { id: request.id, status: "success", adapter_path: "path/to/adapter" }
      }.to change(AiModel, :count).by(1)

      expect(response).to have_http_status(:ok)
      request.reload
      expect(request.status).to eq("fine_tuning_completed")
      expect(request.new_ai_model_id).to eq(AiModel.last.id)
    end

    it "updates status to fine_tuning_failed on failure" do
      post "/api/model_fine_tune_requests/update_status", params: { id: request.id, status: "fail", error: "Training error" }
      expect(response).to have_http_status(:ok)
      request.reload
      expect(request.status).to eq("fine_tuning_failed")
      expect(request.error_message).to eq("Training error")
    end
  end
end
