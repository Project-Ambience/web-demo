class ModelFineTuneRequest < ApplicationRecord
  belongs_to :ai_model
  belongs_to :clinician_type

  validates :name, :description, :parameters, presence: true
  validate :ai_model_must_allow_fine_tune

  enum :status, {
    pending: 0,
    waiting_for_validation: 1,
    validating: 2,
    validation_failed: 3,
    waiting_for_fine_tune: 4,
    fine_tuning: 5,
    failed: 6,
    done: 7
  }

  scope :by_status, ->(status) {
    if status.present? && status != "all"
      statuses = status.split(",")
      where(status: statuses)
    end
  }
  scope :by_base_model, ->(model_id) { where(ai_model_id: model_id) if model_id.present? }
  scope :created_after, ->(date) { where("created_at >= ?", date) if date.present? }
  scope :created_before, ->(date) { where("created_at <= ?", date) if date.present? }
  scope :search_by_name, ->(term) { where("name ILIKE ?", "%#{term}%") if term.present? }

  after_initialize :set_default_status, if: :new_record?
  after_create :publish_fine_tune_request_to_rabbit_mq

  private

  def set_default_status
    self.status ||= :pending
  end

  def publish_fine_tune_request_to_rabbit_mq
    payload = {
      fine_tune_request_id: self.id,
      ai_model_path: self.ai_model.path,
      parameters: self.parameters,
      fine_tune_data: self.fine_tune_data,
      callback_url: ENV["MODEL_FINE_TUNE_REQUEST_CALLBACK_PATH"]
    }

    begin
      MessagePublisher.publish(payload, ENV["MODEL_FINE_TUNE_REQUEST_QUEUE_NAME"])
      self.waiting_for_validation!
    rescue => e
      self.failed!
    end
  end

  def ai_model_must_allow_fine_tune
    if ai_model && !ai_model.allow_fine_tune
      errors.add(:ai_model, "not allow fine-tuning")
    end
  end
end
