class RagDataAddingRequest < ApplicationRecord
  has_many_attached :files

  enum :status, {
    pending: 0,
    done: 1,
    failed: 2
  }
end
