class InterRater < ApplicationRecord
  belongs_to :ai_model

  enum :evaluation_category, {
    fine_tune_model: 0,
    prompt_engineering: 1
  }

  enum :rating, {
    strongly_prefer_first_response: 0,
    prefer_first_response: 1,
    neutral: 2,
    prefer_second_response: 3,
    strongly_prefer_second_response: 4
  }

  validates :prompt, presence: true
  validates :first_response, presence: true
  validates :second_response, presence: true
  validates :evaluation_category, presence: true
  validates :rating, presence: true
end
