FactoryBot.define do
  factory :ai_model do
    name { "Test Ai Model" }
    description { "This is a test AI model description." }
    clinician_type
    keywords { [ "keyword1", "keyword2" ] }
  end
end
