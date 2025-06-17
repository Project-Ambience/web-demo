class Rating < ApplicationRecord
  belongs_to :ai_model
  # --- FIX IS HERE ---
  # Change :value to :rating to match the database column name
  validates :rating, presence: true, inclusion: { in: 1..5 }
end