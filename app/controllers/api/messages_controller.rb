class Api::MessagesController < Api::ApplicationController
  def create
    @conversation = Conversation.find(params[:conversation_id])
    @message = @conversation.messages.create(content: params[:message][:content], role: "user")

    if params[:message][:file].present?
      @message.file.attach(params[:message][:file])
    end

    if @message.persisted?
      MessagePublisher.publish({
        conversation_id: @conversation.id,
        input: [
          { "prompt": @message.content },
          (@message.file.attached? ? { "file": rails_blob_url(@message.file, host: ENV["DOMAIN"], protocol: "http", port: ENV["PORT"]) } : nil)
        ].compact,
        model_path: @conversation.ai_model.path
      }, ENV["USER_PROMPT_QUEUE_NAME"])
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end
