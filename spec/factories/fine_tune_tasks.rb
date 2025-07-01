FactoryBot.define do
  factory :fine_tune_task do
    title { "MyString" }
    parameters { { learning_rate: 0.01 } }
    ai_model
  end
end
