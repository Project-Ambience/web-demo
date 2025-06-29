require "rails_helper"

RSpec.describe ModelFineTuneRequest, type: :model do
  let(:clinician_type) { create(:clinician_type) }
  let(:ai_model) { create(:ai_model, clinician_type: clinician_type) }
  let(:fine_tune_request) { create(:model_fine_tune_request, ai_model: ai_model, clinician_type: clinician_type) }

  describe "associations" do
    it { is_expected.to belong_to(:ai_model) }
    it { is_expected.to belong_to(:clinician_type) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_presence_of(:parameters) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:status).with_values(pending: 0, in_progress: 1, done: 2, failed: 3) }
  end
end
