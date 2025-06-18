class AiModel < ApplicationRecord
  has_many :ratings
  has_many :comments, dependent: :destroy

  belongs_to :clinician_type

  validates :name, presence: true
  validates :description, presence: true

  def average_rating
    return nil if ratings.empty?

    ratings.average(:rating)&.round(1)
  end
end