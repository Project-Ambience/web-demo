class Api::MessagesController < Api::ApplicationController
  def create
    @conversation = Conversation.find(params[:conversation_id])
    @message = @conversation.messages.create(content: params[:message][:content], role: "user")

    if @message.persisted?
      UserPromptPublisher.publish({
        conversation_id: @conversation.id,
        prompt: @message.content
      })
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end
end