require "rails_helper"

RSpec.describe InterRater, type: :model do
  describe "associations" do
    it { should belong_to(:ai_model) }
  end

  describe "validations" do
    it { should validate_presence_of(:first_conversation_id) }
    it { should validate_presence_of(:second_conversation_id) }
  end
end
