class Api::Internal::ResultsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :verify_signature

  def create
    conversation = Conversation.find(params[:conversation_id])
    ai_message = conversation.messages.create!(content: params[:ai_content], role: 'assistant')
    ActionCable.server.broadcast("conversation_#{conversation.id}", { message: ai_message.as_json })
    head :ok
  end

  private

  def verify_signature
    secret = Rails.application.credentials.hmac_secret
    request_body = request.body.read
    signature = "sha256=" + OpenSSL::HMAC.hexdigest("SHA256", secret, request_body)
    unless Rack::Utils.secure_compare(signature, request.headers['X-Signature'])
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end
end