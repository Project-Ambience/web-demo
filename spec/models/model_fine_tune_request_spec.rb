require "rails_helper"

RSpec.describe ModelFineTuneRequest, type: :model do
  let(:clinician_type) { create(:clinician_type) }
  let(:ai_model) { create(:ai_model, clinician_type: clinician_type) }
  let(:fine_tune_request) { build(:model_fine_tune_request, ai_model: ai_model, clinician_type: clinician_type) }

  describe "associations" do
    it { is_expected.to belong_to(:ai_model) }
    it { is_expected.to belong_to(:clinician_type) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_presence_of(:parameters) }

    context "when ai_model does not allow fine-tuning" do
      it "is not valid" do
        expect(fine_tune_request).not_to be_valid
        expect(fine_tune_request.errors[:ai_model]).to include("not allow fine-tuning")
      end
    end
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:status).with_values(pending: 0, in_progress: 1, done: 2, failed: 3) }
  end

  describe "callbacks" do
    let(:ai_model) { create(:ai_model, clinician_type: clinician_type, allow_fine_tune: true) }

    before do
      ENV["MODEL_FINE_TUNE_REQUEST_CALLBACK_PATH"] = "http://example.com/callback"
      ENV["MODEL_FINE_TUNE_REQUEST_QUEUE_NAME"] = "fine_tune_requests"
    end

    it "sets default status to pending on initialization" do
      new_request = ModelFineTuneRequest.new
      expect(new_request.status).to eq("pending")
    end

    it "publishes fine-tune request to RabbitMQ after creation" do
      allow(MessagePublisher).to receive(:publish)
      fine_tune_request.save
      expect(MessagePublisher).to have_received(:publish).with(
        hash_including(
          fine_tune_request_id: fine_tune_request.id,
          ai_model_path: ai_model.path,
          parameters: fine_tune_request.parameters,
          fine_tune_data: fine_tune_request.fine_tune_data,
          callback_url: "http://example.com/callback"
        ),
        "fine_tune_requests"
      )
    end

    it "updates status to in_progress after publishing" do
      allow(MessagePublisher).to receive(:publish)
      fine_tune_request.save
      expect(fine_tune_request.reload.status).to eq("in_progress")
    end

    it "updates status to failed if publishing raises an error" do
      allow(MessagePublisher).to receive(:publish).and_raise("SOME ERROR")
      fine_tune_request.save
      expect(fine_tune_request.reload.status).to eq("failed")
    end
  end
end
