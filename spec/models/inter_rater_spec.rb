require "rails_helper"

RSpec.describe InterRater, type: :model do
  describe "associations" do
    it { should belong_to(:ai_model) }
  end

  describe "validations" do
    it { should validate_presence_of(:prompt) }
    it { should validate_presence_of(:first_response) }
    it { should validate_presence_of(:second_response) }
    it { should validate_presence_of(:evaluation_category) }
    it { should validate_presence_of(:rating) }
  end

  describe "enums" do
    it do
      should define_enum_for(:evaluation_category)
        .with_values(fine_tune_model: 0, prompt_engineering: 1)
    end

    it do
      should define_enum_for(:rating)
        .with_values(
          strongly_prefer_first_response: 0,
          prefer_first_response: 1,
          neutral: 2,
          prefer_second_response: 3,
          strongly_prefer_second_response: 4
        )
    end
  end
end
