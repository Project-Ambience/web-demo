FactoryBot.define do
  factory :model_fine_tune_request do
    name { "MyString" }
    description { "MyString" }
    association :ai_model, factory: :ai_model
    clinician_type
    parameters { { learning_rate: 0.2 } }
    status { :pending }
    fine_tuning_notes { "MyText" }

    trait :with_tunable_model do
      association :ai_model, factory: :ai_model, allow_fine_tune: true
    end
  end
end
