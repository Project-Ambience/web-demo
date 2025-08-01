class Conversation < ApplicationRecord
  belongs_to :ai_model
  has_many :messages, -> { order(created_at: :asc) }, dependent: :destroy

  has_many :first_inter_raters,
  class_name: "InterRater",
  foreign_key: "first_conversation_id",
  dependent: :destroy

  has_many :second_inter_raters,
    class_name: "InterRater",
    foreign_key: "second_conversation_id",
    dependent: :destroy

  has_one_attached :file

  enum :status, {
    awaiting_prompt: 0,
    awaiting_feedback: 1,
    awaiting_rejection_comment: 2,
    completed: 3
  }

  def file_url
    self.file.attached? ? Rails.application.routes.url_helpers.rails_blob_url(self.file, host: ENV["DOMAIN"], protocol: "http", port: ENV["PORT"]) : nil
  end

  def file_name
    self.file.attached? ? self.file.filename.to_s : nil
  end

  def base_prompt
    self.messages&.first&.content
  end

  def first_response
    self.messages&.second&.content
  end
end
