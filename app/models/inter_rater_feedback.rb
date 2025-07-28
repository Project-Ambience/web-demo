class InterRaterFeedback < ApplicationRecord
  belongs_to :inter_rater

  validates :rating, presence: true
  validates :comment, presence: true

  enum :rating, {
    strongly_prefer_first_response: 0,
    prefer_first_response: 1,
    prefer_second_response: 2,
    strongly_prefer_second_response: 3
  }
end
