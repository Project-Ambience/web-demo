class Comment < ApplicationRecord
  belongs_to :ai_model

  validates :comment, presence: true
end
