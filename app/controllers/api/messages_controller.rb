class Api::MessagesController < Api::ApplicationController
  def create
    @conversation = Conversation.find(params[:conversation_id])
    @message = @conversation.messages.create(content: params[:message][:content], role: "user")

    if @message.persisted?
      MessagePublisher.publish({
        conversation_id: @conversation.id,
        prompt: @message.content,
        path: @conversation.ai_model.path
      }, ENV["USER_PROMPT_QUEUE_NAME"])
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end
