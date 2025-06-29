class ModelFineTuneRequest < ApplicationRecord
  belongs_to :ai_model
  belongs_to :clinician_type
  validates :name, :description, :parameters, presence: true

  enum :status, {
    pending: 0,
    in_progress: 1,
    done: 2,
    failed: 3
  }
end
