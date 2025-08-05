class ModelFineTuneRequest < ApplicationRecord
  belongs_to :ai_model
  belongs_to :clinician_type

  validates :name, :description, :parameters, presence: true
  validate :ai_model_must_allow_fine_tune

  enum :status, {
    pending: 0,
    waiting_for_formatting: 1,
    formatting_in_progress: 2,
    formatting_failed: 3,
    awaiting_confirmation: 4,
    waiting_for_fine_tune: 5,
    fine_tuning_in_progress: 6,
    fine_tuning_failed: 7,
    fine_tuning_completed: 8
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
  after_commit :broadcast_status_update, on: [:create, :update]

  private

  def set_default_status
    self.status ||= :pending
  end

  def broadcast_status_update
    return unless saved_change_to_status?

    ActionCable.server.broadcast("fine_tune_status_updates", { id: self.id, status: self.status })
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
