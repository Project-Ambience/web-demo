class ModelFineTuneRequest < ApplicationRecord
  belongs_to :ai_model
  belongs_to :clinician_type

  validates :name, :description, :parameters, presence: true
  validate :ai_model_must_allow_fine_tune

  enum :status, {
    pending: 0,
    waiting_for_formatting: 1,
    formatting_failed: 2,
    awaiting_confirmation: 3,
    waiting_for_fine_tune: 4,
    failed: 5,
    done: 6
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
  after_create :publish_formatting_request

  private

  def set_default_status
    self.status ||= :pending
  end

  def publish_formatting_request
    payload = {
      fine_tune_request_id: self.id,
      ai_model_path: self.ai_model.path,
      parameters: self.parameters,
      fine_tune_data: self.fine_tune_data,
      callback_url: ENV["MODEL_FORMATTING_COMPLETE_CALLBACK_PATH"]
    }

    begin
      MessagePublisher.publish(payload, ENV["MODEL_FORMATTING_REQUEST_QUEUE_NAME"])
      self.waiting_for_formatting!
    rescue => e
      self.update(status: :formatting_failed, error_message: e.message)
    end
  end

  def ai_model_must_allow_fine_tune
    if ai_model && !ai_model.allow_fine_tune
      errors.add(:ai_model, "not allow fine-tuning")
    end
  end
end
