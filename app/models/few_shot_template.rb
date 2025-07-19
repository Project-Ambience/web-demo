class FewShotTemplate < ApplicationRecord
  has_many :examples, dependent: :destroy, inverse_of: :few_shot_template
  accepts_nested_attributes_for :examples, allow_destroy: true

  validates :name, presence: true, uniqueness: true
end
