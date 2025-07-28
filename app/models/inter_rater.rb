class InterRater < ApplicationRecord
  belongs_to :ai_model
  belongs_to :first_conversation, class_name: "Conversation"
  belongs_to :second_conversation, class_name: "Conversation"

  validates :first_conversation_id, presence: true
  validates :second_conversation_id, presence: true
end
