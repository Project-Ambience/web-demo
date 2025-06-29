FactoryBot.define do
  factory :model_fine_tune_request do
    name { "MyString" }
    description { "MyString" }
    ai_model { nil }
    clinician_type { nil }
    parameters { {learning_rate: 0.2} }
    status { 1 }
  end
end
