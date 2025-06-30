class ClinicianType < ApplicationRecord
  has_many :ai_models

  validates :name, presence: true

  def self.ransackable_attributes(auth_object = nil)
    [ "created_at", "id", "name", "updated_at" ]
  end
end
