FactoryBot.define do
  factory :inter_rater do
    prompt { "MyString" }
    first_response { "MyString" }
    second_response { "MyString" }
    file_url { "MyString" }
    ai_model
    evaluation_type { 0 }
  end
end
