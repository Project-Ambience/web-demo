require "rails_helper"

RSpec.describe FineTuneTask, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:ai_model) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:parameters) }
  end
end
