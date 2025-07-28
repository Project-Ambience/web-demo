require "rails_helper"

RSpec.describe ModelFineTuneRequest, type: :model do
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
        request = build(:model_fine_tune_request)
        expect(request).not_to be_valid
        expect(request.errors[:ai_model]).to include("not allow fine-tuning")
      end
    end

    context "when ai_model allows fine-tuning" do
      it "is valid" do
        request = build(:model_fine_tune_request, :with_tunable_model)
        expect(request).to be_valid
      end
    end
  end

  describe "enums" do
    it do
      is_expected.to define_enum_for(:status).with_values(
        pending: 0,
        waiting_for_validation: 1,
        validating: 2,
        validation_failed: 3,
        waiting_for_fine_tune: 4,
        fine_tuning: 5,
        failed: 6,
        done: 7
      )
    end
  end

  describe "callbacks" do
    let(:fine_tune_request) { build(:model_fine_tune_request, :with_tunable_model) }

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
          callback_url: "http://example.com/callback"
        ),
        "fine_tune_requests"
      )
    end

    it "updates status to waiting_for_validation after publishing" do
      allow(MessagePublisher).to receive(:publish)
      fine_tune_request.save
      expect(fine_tune_request.reload.status).to eq("waiting_for_validation")
    end

    it "updates status to failed if publishing raises an error" do
      allow(MessagePublisher).to receive(:publish).and_raise("SOME ERROR")
      fine_tune_request.save
      expect(fine_tune_request.reload.status).to eq("failed")
    end
  end

  describe "scopes" do
    let(:tunable_model_1) { create(:ai_model, allow_fine_tune: true) }
    let(:tunable_model_2) { create(:ai_model, allow_fine_tune: true) }

    before do
      allow_any_instance_of(ModelFineTuneRequest).to receive(:publish_fine_tune_request_to_rabbit_mq).and_return(true)
    end

    let!(:done_request) { create(:model_fine_tune_request, ai_model: tunable_model_1, status: :done, created_at: 1.day.ago) }
    let!(:failed_request) { create(:model_fine_tune_request, ai_model: tunable_model_1, status: :failed, created_at: 2.days.ago) }
    let!(:tuning_request) { create(:model_fine_tune_request, ai_model: tunable_model_1, status: :fine_tuning, name: "Searchable Model") }
    let!(:other_model_request) { create(:model_fine_tune_request, ai_model: tunable_model_2, status: :done) }

    it ".by_status returns the correct requests" do
      expect(ModelFineTuneRequest.by_status("done")).to contain_exactly(done_request, other_model_request)
      expect(ModelFineTuneRequest.by_status("failed,validation_failed")).to contain_exactly(failed_request)
    end

    it ".by_base_model returns requests for a specific model" do
      expect(ModelFineTuneRequest.by_base_model(tunable_model_1.id)).to contain_exactly(done_request, failed_request, tuning_request)
      expect(ModelFineTuneRequest.by_base_model(tunable_model_2.id)).to contain_exactly(other_model_request)
    end

    it ".search_by_name finds requests by name" do
      expect(ModelFineTuneRequest.search_by_name("Searchable")).to contain_exactly(tuning_request)
      expect(ModelFineTuneRequest.search_by_name("NonExistent")).to be_empty
    end

    it ".created_after and .created_before filter by date" do
      expect(ModelFineTuneRequest.created_after(1.5.days.ago)).to contain_exactly(done_request, tuning_request, other_model_request)
      expect(ModelFineTuneRequest.created_before(1.5.days.ago)).to contain_exactly(failed_request)
    end
  end
end
