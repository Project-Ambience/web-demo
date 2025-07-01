class Message < ApplicationRecord
  belongs_to :conversation
  has_one_attached :file
end
