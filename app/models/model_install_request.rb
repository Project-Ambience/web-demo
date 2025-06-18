class ModelInstallRequest < ApplicationRecord
  belongs_to :clinician_type
  validates :name, :description, :path, presence: true

  enum :status, {
    pending: 0,
    in_progress: 1,
    done: 2,
    failed: 3
  }

  include HTTParty

  after_initialize :set_default_status, if: :new_record?
  after_create :notify_model_installer_service

  def self.ransackable_associations(auth_object = nil)
    ["clinician_type"]
  end

  def self.ransackable_attributes(auth_object = nil)
    ["clinician_type_id", "id", "name", "path", "status"]
  end

  private

  def set_default_status
    self.status ||= :pending
  end

  def notify_model_installer_service
    response = HTTParty.post(
      ENV["MODEL_INSTALLER_SERVICE_PATH"],
      body: {
        id: self.id,
        model_path: self.path,
        callback_url: ENV["MODEL_INSTALL_REQUEST_CALLBACK_PATH"]
      }.to_json,
      headers: { "Content-Type" => "application/json" }
    )

    # Skip endpoint for now
    if response.code.to_i == 200
      self.in_progress!
    else
      self.failed!
    end
  end
end
