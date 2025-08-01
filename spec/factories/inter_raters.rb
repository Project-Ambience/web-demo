FactoryBot.define do
  factory :inter_rater do
    first_conversation_id { create(:conversation).id }
    second_conversation_id { create(:conversation).id }
    ai_model
  end
end
