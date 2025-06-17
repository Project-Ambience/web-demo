class AiModel < ApplicationRecord
  belongs_to :clinician_type
  has_many :ratings
  has_many :comments, -> { order(created_at: :desc) }

  def average_rating
    ratings.average(:rating).to_f.round(1)
  end

  # Override as_json to add the clinician_type name conditionally
  def as_json(options = {})
    super(options).tap do |json|
      if options[:add_clinician_type_name]
        json['clinician_type'] = self.clinician_type.name
      end
    end
  end
end