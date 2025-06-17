class Conversation < ApplicationRecord
  belongs_to :ai_model
  has_many :messages, dependent: :destroy
end