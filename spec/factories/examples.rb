FactoryBot.define do
  factory :example do
    input { "Sample input." }
    output { "Sample output." }
    few_shot_template
  end
end
