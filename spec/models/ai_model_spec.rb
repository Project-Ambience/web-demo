require "rails_helper"

RSpec.describe AiModel, type: :model do
  let(:clinician_type) { create(:clinician_type) }
  let(:ai_model) { create(:ai_model, clinician_type: clinician_type) }

  describe "associations" do
    it { is_expected.to have_many(:comments).dependent(:destroy) }
    it { is_expected.to have_many(:fine_tune_tasks).dependent(:destroy) }
    it { is_expected.to have_many(:ratings).dependent(:destroy) }
    it { is_expected.to belong_to(:clinician_type) }
    it { is_expected.to belong_to(:base_model).class_name("AiModel").optional }
    it { is_expected.to have_many(:fine_tune_tasks).dependent(:destroy) }
    it { is_expected.to have_many(:model_fine_tune_requests).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:description) }
  end

  describe "#average_rating" do
    context "when there are no ratings" do
      it "returns nil" do
        expect(ai_model.average_rating).to be_nil
      end
    end

    context "when there are ratings" do
      before do
        create_list(:rating, 3, ai_model: ai_model, rating: 4)
        create_list(:rating, 2, ai_model: ai_model, rating: 5)
      end

      it "returns the average rating rounded to one decimal place" do
        expect(ai_model.average_rating).to eq(4.4)
      end
    end
  end

  describe "#is_fine_tune_model" do
    context "when the model has a base model" do
      let(:base_ai_model) { create(:ai_model, clinician_type: clinician_type) }
      let(:ai_model) { create(:ai_model, clinician_type: clinician_type, base_model: base_ai_model) }

      it "returns true" do
        expect(ai_model.is_fine_tune_model).to be true
      end
    end

    context "when the model does not have a base model" do
      let(:ai_model) { create(:ai_model, clinician_type: clinician_type) }

      it "returns false" do
        expect(ai_model.is_fine_tune_model).to be false
      end
    end
  end

  describe "#as_json" do
    it "includes clinician type name when requested" do
      json = ai_model.as_json(add_clinician_type_name: true)
      expect(json["clinician_type"]).to eq(clinician_type.name)
    end

    it "does not include clinician type name by default" do
      json = ai_model.as_json
      expect(json).not_to have_key("clinician_type")
    end
  end
end
