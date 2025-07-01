class ModelFineTuneRequest < ApplicationRecord
  belongs_to :ai_model
  belongs_to :clinician_type

  validates :name, :description, :parameters, presence: true
  validate :ai_model_must_allow_fine_tune

  enum :status, {
    pending: 0,
    in_progress: 1,
    done: 2,
    failed: 3
  }

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

    # TODO: Add this to a job
    # Add reason for failure
    begin
      MessagePublisher.publish(payload, ENV["MODEL_FINE_TUNE_REQUEST_QUEUE_NAME"])
      self.in_progress!
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
