class ClinicianType < ApplicationRecord
  has_many :ai_models

  validates :name, presence: true
end
