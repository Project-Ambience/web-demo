class RagDataAddingRequest < ApplicationRecord
  has_one_attached :file

  enum :status, {
    pending: 0,
    done: 1,
    failed: 2
  }

  def file_url
    self.file.attached? ? Rails.application.routes.url_helpers.rails_blob_url(self.file, host: ENV["DOMAIN"], protocol: "http", port: ENV["PORT"]) : nil
  end

  def file_name
    self.file.attached? ? self.file.filename.to_s : nil
  end
end
