require "rails_helper"

RSpec.describe RagDataAddingRequest, type: :model do
  describe "associations" do
    it { is_expected.to have_many_attached(:files) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:status).with_values(pending: 0, done: 1, failed: 2) }
  end
end
