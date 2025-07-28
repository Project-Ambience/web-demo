class InterRater < ApplicationRecord
  belongs_to :ai_model
  belongs_to :first_conversation, class_name: "Conversation"
  belongs_to :second_conversation, class_name: "Conversation"

  enum :rating, {
    strongly_prefer_first_response: 0,
    prefer_first_response: 1,
    prefer_second_response: 2,
    strongly_prefer_second_response: 3
  }

  validates :first_conversation_id, presence: true
  validates :second_conversation_id, presence: true
end
