class Conversation < ApplicationRecord
  belongs_to :ai_model
  has_many :messages, -> { order(created_at: :asc) }, dependent: :destroy

  enum :status, {
    awaiting_prompt: 0,
    awaiting_feedback: 1,
    awaiting_rejection_comment: 2,
    completed: 3,
    processing: 4
  }
end
