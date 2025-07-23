FactoryBot.define do
  factory :model_fine_tune_request do
    name { "MyString" }
    description { "MyString" }
    ai_model
    clinician_type
    parameters { "{ learning_rate: 0.2 }" }
    status { 1 }
    fine_tuning_notes { "MyText" }
  end
end
