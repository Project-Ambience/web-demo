class RagDataAddingRequest < ApplicationRecord
  has_many_attached :files

  enum :status, {
    pending: 0,
    done: 1,
    failed: 2
  }

  def file_urls
    return [] unless files.attached?

    files.map do |file|
      Rails.application.routes.url_helpers.rails_blob_url(
        file,
        host: ENV["DOMAIN"],
        protocol: "http",
        port: ENV["PORT"]
      )
    end
  end
end
