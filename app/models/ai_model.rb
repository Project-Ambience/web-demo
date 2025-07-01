class AiModel < ApplicationRecord
  has_many :ratings, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :fine_tune_tasks, dependent: :destroy
  has_many :model_fine_tune_requests, dependent: :destroy
  belongs_to :base_model, class_name: "AiModel", optional: true

  belongs_to :clinician_type

  validates :name, presence: true
  validates :description, presence: true

  def average_rating
    return nil if ratings.empty?

    ratings.average(:rating)&.to_f.round(1)
  end

  def as_json(options = {})
    super(options).tap do |json|
      if options[:add_clinician_type_name]
        json["clinician_type"] = self.clinician_type.name
      end
    end
  end

  def self.ransackable_associations(auth_object = nil)
    [ "base_model", "clinician_type" ]
  end

  def self.ransackable_attributes(auth_object = nil)
    [ "allow_fine_tune", "base_model_id", "clinician_type_id", "created_at", "description", "fine_tune_data_format", "id", "id_value", "keywords", "name", "updated_at" ]
  end
end
