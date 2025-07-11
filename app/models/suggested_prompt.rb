class SuggestedPrompt < ApplicationRecord
  belongs_to :ai_model

  def self.ransackable_associations(auth_object = nil)
    [ "ai_model" ]
  end

  def self.ransackable_attributes(auth_object = nil)
    [ "ai_model_id", "created_at", "id", "prompt", "updated_at" ]
  end
end
