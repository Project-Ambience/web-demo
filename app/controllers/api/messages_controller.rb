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
          { "file_url": @message.file_url }
        ].compact,
        base_model_path: @conversation.ai_model.path,
        adapter_path: @conversation.ai_model.adapter_path
      }, ENV["USER_PROMPT_QUEUE_NAME"])
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end
