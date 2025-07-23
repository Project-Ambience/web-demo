FactoryBot.define do
  factory :model_install_request do
    name { "Example Model" }
    description { "This is an example model installation request." }
    clinician_type
    keyword { "example_keyword" }
    path { "http://example.com/model" }
    family { "example_family" }
    parameter_size { "1B" }
  end
end
