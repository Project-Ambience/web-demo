require 'rails_helper'

RSpec.describe InterRaterFeedback, type: :model do
  describe "associations" do
    it { should belong_to(:inter_rater) }
  end

  describe "validations" do
    it { should validate_presence_of(:rating) }
    it { should validate_presence_of(:comment) }
  end

  describe "enums" do
    it do
      should define_enum_for(:rating).with_values(
        strongly_prefer_first_response: 0,
        prefer_first_response: 1,
        prefer_second_response: 2,
        strongly_prefer_second_response: 3
      )
    end
  end

  describe "valid factory" do
    let(:inter_rater) { create(:inter_rater) }

    it "is valid with valid attributes" do
      feedback = described_class.new(
        inter_rater: inter_rater,
        rating: "prefer_first_response",
        comment: "Clear preference for the first."
      )
      expect(feedback).to be_valid
    end

    it "is invalid without a comment" do
      feedback = described_class.new(
        inter_rater: inter_rater,
        rating: "prefer_first_response",
        comment: nil
      )
      expect(feedback).not_to be_valid
    end

    it "is invalid without a rating" do
      feedback = described_class.new(
        inter_rater: inter_rater,
        rating: nil,
        comment: "Missing rating."
      )
      expect(feedback).not_to be_valid
    end
  end
end
