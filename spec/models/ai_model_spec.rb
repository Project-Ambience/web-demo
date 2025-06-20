require "rails_helper"

RSpec.describe AiModel, type: :model do
  let(:clinician_type) { create(:clinician_type) }
  let(:ai_model) { create(:ai_model, clinician_type: clinician_type) }

  describe "associations" do
    it { is_expected.to have_many(:comments).dependent(:destroy) }
    it { is_expected.to have_many(:ratings) }
    it { is_expected.to belong_to(:clinician_type) }
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
end
