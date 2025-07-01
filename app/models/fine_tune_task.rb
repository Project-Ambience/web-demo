class FineTuneTask < ApplicationRecord
  belongs_to :ai_model

  validates :title, presence: true
  validates :parameters, presence: true

  def self.ransackable_associations(auth_object = nil)
    [ "ai_model" ]
  end

  def self.ransackable_attributes(auth_object = nil)
    [ "ai_model_id", "created_at", "id", "parameters", "title", "updated_at" ]
  end
end
