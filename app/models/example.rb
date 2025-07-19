class Example < ApplicationRecord
  belongs_to :few_shot_template

  validates :input, presence: true
  validates :output, presence: true
end
